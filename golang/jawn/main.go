package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Config 应用配置
type Config struct {
	Port        string
	Environment string
	AppURL      string
	IsOnPrem    bool
}

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

// APIResponse 通用API响应
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// RequestLog 请求日志
type RequestLog struct {
	ID          string                 `json:"id"`
	Model       string                 `json:"model"`
	Provider    string                 `json:"provider"`
	Prompt      string                 `json:"prompt,omitempty"`
	Response    string                 `json:"response,omitempty"`
	TokensIn    int                    `json:"tokens_in"`
	TokensOut   int                    `json:"tokens_out"`
	Cost        float64                `json:"cost"`
	Latency     int64                  `json:"latency_ms"`
	Status      string                 `json:"status"`
	CreatedAt   time.Time              `json:"created_at"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// User 用户结构
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	OrgID     string    `json:"org_id"`
	CreatedAt time.Time `json:"created_at"`
}

// Organization 组织结构
type Organization struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Plan      string    `json:"plan"`
	CreatedAt time.Time `json:"created_at"`
}

// APIKey API密钥
type APIKey struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Key       string    `json:"key"`
	OrgID     string    `json:"org_id"`
	CreatedAt time.Time `json:"created_at"`
}

// ModelInfo 模型信息
type ModelInfo struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Provider string  `json:"provider"`
	CostPer1KInput  float64 `json:"cost_per_1k_input"`
	CostPer1KOutput float64 `json:"cost_per_1k_output"`
}

// DashboardStats 仪表板统计
type DashboardStats struct {
	TotalRequests int64    `json:"total_requests"`
	TotalTokens   int64    `json:"total_tokens"`
	TotalCost     float64  `json:"total_cost"`
	AvgLatency    float64  `json:"avg_latency_ms"`
	ActiveModels  []string `json:"active_models"`
}

// ErrorResponse 错误响应
type ErrorResponse struct {
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

var config Config

func main() {
	// 加载环境变量
	godotenv.Load()

	// 初始化配置
	config = Config{
		Port:        getEnv("PORT", "8585"),
		Environment: getEnv("ENVIRONMENT", "development"),
		AppURL:      getEnv("APP_URL", "http://localhost:3000"),
		IsOnPrem:    getEnv("IS_ON_PREM", "false") == "true",
	}

	// 设置 Gin 模式
	if config.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// 创建路由
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())
	r.Use(loggerMiddleware())
	r.Use(timeoutMiddleware())

	// 注册路由
	registerRoutes(r)

	// 创建 HTTP 服务器
	srv := &http.Server{
		Addr:    ":" + config.Port,
		Handler: r,
	}

	// 优雅关闭
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)
		<-sigChan

		log.Println("收到关闭信号，正在优雅关闭...")
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("服务器关闭错误: %v", err)
		}
	}()

	log.Printf("🚀 Jawn API 服务启动于 http://localhost:%s", config.Port)
	log.Printf("📊 环境: %s", config.Environment)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

// 注册路由
func registerRoutes(r *gin.Engine) {
	// 健康检查
	r.GET("/healthcheck", healthCheck)

	// API v1 路由组
	v1 := r.Group("/v1")
	{
		// 公开路由
		public := v1.Group("/public")
		{
			public.GET("/stats", getPublicStats)
		}

		// 需要认证的路由
		api := v1.Group("")
		api.Use(authMiddleware())
		{
			// 请求日志
			api.GET("/requests", getRequests)
			api.GET("/requests/:id", getRequestByID)
			api.POST("/requests", createRequest)

			// 用户管理
			api.GET("/users", getUsers)
			api.GET("/users/:id", getUserByID)
			api.PUT("/users/:id", updateUser)

			// 组织管理
			api.GET("/organizations", getOrganizations)
			api.GET("/organizations/:id", getOrganizationByID)
			api.POST("/organizations", createOrganization)

			// API Keys
			api.GET("/keys", getAPIKeys)
			api.POST("/keys", createAPIKey)
			api.DELETE("/keys/:id", deleteAPIKey)

			// 模型
			api.GET("/models", getModels)
			api.GET("/models/:id", getModelByID)

			// 统计
			api.GET("/stats/dashboard", getDashboardStats)

			// 代理路由
			api.POST("/gateway/*path", gatewayProxy)
		}
	}
}

// CORS 中间件
func corsMiddleware() gin.HandlerFunc {
	allowedOrigins := getAllowedOrigins()

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowed := false

		if origin == "" || config.IsOnPrem {
			allowed = true
		} else {
			for _, pattern := range allowedOrigins {
				if pattern.MatchString(origin) {
					allowed = true
					break
				}
			}
		}

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Helicone-Authorization, X-API-Key")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// 日志中间件
func loggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Printf("[Jawn] %s %s %s %d %v", clientIP, method, path, statusCode, latency)
	}
}

// 超时中间件
func timeoutMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		timeout := time.AfterFunc(10*time.Second, func() {
			if !c.Writer.Written() {
				c.AbortWithStatusJSON(http.StatusRequestTimeout, ErrorResponse{
					Message: "请求超时",
				})
			}
		})
		defer timeout.Stop()

		c.Next()
	}
}

// 认证中间件
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			authHeader = c.GetHeader("Helicone-Authorization")
		}

		// 简化版认证 - 实际应验证 JWT 或 API Key
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{
				Message: "未授权",
			})
			return
		}

		// 设置用户信息到上下文
		c.Set("userID", "user_001")
		c.Set("orgID", "org_001")
		c.Next()
	}
}

// 健康检查
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "healthy :)",
		Timestamp: time.Now(),
	})
}

// 获取公开统计
func getPublicStats(c *gin.Context) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"total_requests": 1000000,
			"total_tokens":   500000000,
		},
	})
}

// 获取请求列表
func getRequests(c *gin.Context) {
	requests := []RequestLog{
		{
			ID:        "req_001",
			Model:     "gpt-4",
			Provider:  "openai",
			Prompt:    "你好",
			Response:  "你好！有什么我可以帮助你的吗？",
			TokensIn:  10,
			TokensOut: 15,
			Cost:      0.002,
			Latency:   1200,
			Status:    "success",
			CreatedAt: time.Now().Add(-time.Hour),
		},
		{
			ID:        "req_002",
			Model:     "claude-3-opus",
			Provider:  "anthropic",
			Prompt:    "解释量子计算",
			Response:  "量子计算是一种利用量子力学原理进行计算的技术...",
			TokensIn:  50,
			TokensOut: 200,
			Cost:      0.015,
			Latency:   2500,
			Status:    "success",
			CreatedAt: time.Now().Add(-30 * time.Minute),
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    requests,
	})
}

// 获取单个请求
func getRequestByID(c *gin.Context) {
	id := c.Param("id")
	request := RequestLog{
		ID:        id,
		Model:     "gpt-4",
		Provider:  "openai",
		Prompt:    "你好",
		Response:  "你好！有什么我可以帮助你的吗？",
		TokensIn:  10,
		TokensOut: 15,
		Cost:      0.002,
		Latency:   1200,
		Status:    "success",
		CreatedAt: time.Now(),
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    request,
	})
}

// 创建请求
func createRequest(c *gin.Context) {
	var req RequestLog
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	req.ID = "req_" + fmt.Sprintf("%d", time.Now().Unix())
	req.CreatedAt = time.Now()

	c.JSON(http.StatusCreated, APIResponse{
		Success: true,
		Data:    req,
	})
}

// 获取用户列表
func getUsers(c *gin.Context) {
	users := []User{
		{
			ID:        "user_001",
			Email:     "admin@helicone.ai",
			Name:      "管理员",
			OrgID:     "org_001",
			CreatedAt: time.Now().Add(-30 * 24 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    users,
	})
}

// 获取单个用户
func getUserByID(c *gin.Context) {
	id := c.Param("id")
	user := User{
		ID:        id,
		Email:     "user@example.com",
		Name:      "用户",
		OrgID:     "org_001",
		CreatedAt: time.Now(),
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    user,
	})
}

// 更新用户
func updateUser(c *gin.Context) {
	id := c.Param("id")
	var req User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	req.ID = id
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    req,
	})
}

// 获取组织列表
func getOrganizations(c *gin.Context) {
	orgs := []Organization{
		{
			ID:        "org_001",
			Name:      "Helicone",
			Plan:      "enterprise",
			CreatedAt: time.Now().Add(-30 * 24 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    orgs,
	})
}

// 获取单个组织
func getOrganizationByID(c *gin.Context) {
	id := c.Param("id")
	org := Organization{
		ID:        id,
		Name:      "Helicone",
		Plan:      "enterprise",
		CreatedAt: time.Now(),
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    org,
	})
}

// 创建组织
func createOrganization(c *gin.Context) {
	var req Organization
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	req.ID = "org_" + fmt.Sprintf("%d", time.Now().Unix())
	req.CreatedAt = time.Now()

	c.JSON(http.StatusCreated, APIResponse{
		Success: true,
		Data:    req,
	})
}

// 获取 API Keys
func getAPIKeys(c *gin.Context) {
	keys := []APIKey{
		{
			ID:        "key_001",
			Name:      "Production Key",
			Key:       "hk_****1234",
			OrgID:     "org_001",
			CreatedAt: time.Now().Add(-7 * 24 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    keys,
	})
}

// 创建 API Key
func createAPIKey(c *gin.Context) {
	var req APIKey
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	req.ID = "key_" + fmt.Sprintf("%d", time.Now().Unix())
	req.Key = "hk_" + generateRandomKey()
	req.CreatedAt = time.Now()

	c.JSON(http.StatusCreated, APIResponse{
		Success: true,
		Data:    req,
	})
}

// 删除 API Key
func deleteAPIKey(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    map[string]string{"deleted": id},
	})
}

// 获取模型列表
func getModels(c *gin.Context) {
	models := []ModelInfo{
		{
			ID:              "gpt-4",
			Name:            "GPT-4",
			Provider:        "openai",
			CostPer1KInput:  0.03,
			CostPer1KOutput: 0.06,
		},
		{
			ID:              "gpt-4-turbo",
			Name:            "GPT-4 Turbo",
			Provider:        "openai",
			CostPer1KInput:  0.01,
			CostPer1KOutput: 0.03,
		},
		{
			ID:              "claude-3-opus",
			Name:            "Claude 3 Opus",
			Provider:        "anthropic",
			CostPer1KInput:  0.015,
			CostPer1KOutput: 0.075,
		},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    models,
	})
}

// 获取单个模型
func getModelByID(c *gin.Context) {
	id := c.Param("id")
	model := ModelInfo{
		ID:              id,
		Name:            "GPT-4",
		Provider:        "openai",
		CostPer1KInput:  0.03,
		CostPer1KOutput: 0.06,
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    model,
	})
}

// 获取仪表板统计
func getDashboardStats(c *gin.Context) {
	stats := DashboardStats{
		TotalRequests: 1000000,
		TotalTokens:   500000000,
		TotalCost:     1500.50,
		AvgLatency:    1200.5,
		ActiveModels:  []string{"gpt-4", "gpt-4-turbo", "claude-3-opus"},
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    stats,
	})
}

// 网关代理
func gatewayProxy(c *gin.Context) {
	path := c.Param("path")

	// 读取请求体
	body, _ := c.GetRawData()

	// 转发到 LLM 提供商
	provider := c.GetHeader("X-Provider")
	if provider == "" {
		provider = "openai"
	}

	log.Printf("代理请求到 %s: %s", provider, path)

	// 返回模拟响应
	response := map[string]interface{}{
		"id":      "chatcmpl-123",
		"object":  "chat.completion",
		"created": time.Now().Unix(),
		"model":   "gpt-4",
		"choices": []map[string]interface{}{
			{
				"index": 0,
				"message": map[string]string{
					"role":    "assistant",
					"content": "这是代理响应",
				},
				"finish_reason": "stop",
			},
		},
		"usage": map[string]int{
			"prompt_tokens":     10,
			"completion_tokens": 15,
			"total_tokens":      25,
		},
	}

	c.JSON(http.StatusOK, response)
}

// 辅助函数

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getAllowedOrigins() []*regexp.Regexp {
	patterns := []string{
		`^https?://(www\.)?helicone\.ai$`,
		`^https?://helicone-[a-z0-9-]+-helicone\.vercel\.app$`,
		`^https?://(www\.)?helicone\.vercel\.app$`,
		`^https?://localhost:3000$`,
	}

	var regexps []*regexp.Regexp
	for _, p := range patterns {
		if r, err := regexp.Compile(p); err == nil {
			regexps = append(regexps, r)
		}
	}
	return regexps
}

func generateRandomKey() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 32)
	for i := range result {
		result[i] = chars[time.Now().UnixNano()%int64(len(chars))]
	}
	return string(result)
}

// 错误处理
func init() {
	gin.DisableConsoleColor()
}
