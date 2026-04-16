-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建角色
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

-- 创建 auth schema
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- 创建 auth.users 表
CREATE TABLE auth.users (
    id uuid not null,
    email character varying(255) null,
    last_sign_in_at timestamp without time zone null,
    created_at timestamp without time zone default now(),
    constraint users_pkey primary key (id)
) TABLESPACE pg_default;

GRANT ALL ON TABLE auth.users TO postgres;
GRANT ALL ON TABLE auth.users TO anon;
GRANT ALL ON TABLE auth.users TO authenticated;
GRANT ALL ON TABLE auth.users TO service_role;

CREATE INDEX IF NOT EXISTS users_id_idx on auth.users using btree (id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS users_id_email_idx on auth.users using btree (id, lower((email)::text)) TABLESPACE pg_default;

-- 创建 better-auth 所需的表
CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "image" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "auth_user_id" UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE
);

CREATE TABLE "session" (
    "id" TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITHOUT TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITHOUT TIME ZONE,
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("accountId", "providerId")
);

CREATE TABLE "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, value)
);

-- 创建 organization 表
CREATE TABLE "organization" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE,
    "logo" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "owner" UUID REFERENCES auth.users(id),
    "is_personal" BOOLEAN DEFAULT FALSE,
    "tier" TEXT DEFAULT 'free',
    "color" TEXT,
    "icon" TEXT,
    "has_onboarded" BOOLEAN DEFAULT FALSE,
    "soft_delete" BOOLEAN DEFAULT FALSE,
    "domain" TEXT,
    "org_provider_key" TEXT,
    "limits" JSONB DEFAULT '{}'::jsonb,
    "gateway_disabled" BOOLEAN DEFAULT FALSE,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_subscription_item_id" TEXT,
    "subscription_status" TEXT,
    "plan" TEXT DEFAULT 'free',
    "is_main_org" BOOLEAN DEFAULT FALSE,
    "reseller_id" UUID,
    "org_type" TEXT DEFAULT 'customer',
    "percent_to_log" INTEGER DEFAULT 100,
    "has_onboarded_integrations" BOOLEAN DEFAULT FALSE,
    "has_integrated" BOOLEAN DEFAULT FALSE
);

-- 创建 organization_member 表
CREATE TABLE "organization_member" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "organization" UUID NOT NULL REFERENCES "organization"(id) ON DELETE CASCADE,
    "member" UUID REFERENCES auth.users(id),
    "user" TEXT REFERENCES "user"(id),
    "org_role" INTEGER DEFAULT 0
);

-- 创建 helicone_api_keys 表
CREATE TABLE "helicone_api_keys" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "api_key_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES auth.users(id),
    "api_key_name" TEXT DEFAULT 'default',
    "organization_id" UUID REFERENCES "organization"(id)
);

-- 创建 helicone_proxy_keys 表
CREATE TABLE "helicone_proxy_keys" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "provider_key" TEXT,
    "provider_name" TEXT NOT NULL,
    "org_id" UUID NOT NULL REFERENCES "organization"(id),
    "soft_delete" BOOLEAN DEFAULT FALSE,
    "provider_key_name" TEXT DEFAULT 'default'
);

-- 创建 request 表（简化版）
CREATE TABLE "request" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "body" JSONB,
    "path" TEXT,
    "auth_hash" TEXT,
    "user_id" UUID,
    "prompt_id" UUID,
    "properties" JSONB DEFAULT '{}'::jsonb,
    "provider" TEXT,
    "model" TEXT,
    "model_override" TEXT,
    "helicone_org_id" UUID REFERENCES "organization"(id),
    "is_playground" BOOLEAN DEFAULT FALSE,
    " helicone_user" TEXT,
    "country_code" TEXT,
    "request_ip" TEXT
);

-- 创建 response 表（简化版）
CREATE TABLE "response" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "request" UUID REFERENCES "request"(id),
    "body" JSONB,
    "status" INTEGER,
    "completion_tokens" INTEGER,
    "prompt_tokens" INTEGER,
    "delay_ms" INTEGER,
    "model" TEXT,
    "feedback" JSONB,
    "prompt_tokens_over_time" JSONB,
    "completion_tokens_over_time" JSONB,
    "time_to_first_token" INTEGER,
    "provider" TEXT,
    "country_code" TEXT
);

-- 创建 helicone_settings 表
CREATE TABLE "helicone_settings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT UNIQUE NOT NULL,
    "settings" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 插入默认设置
INSERT INTO "helicone_settings" (name, settings) VALUES 
    ('key:slack_channel', '{}'),
    ('key:slack_user_token', '{}')
ON CONFLICT (name) DO NOTHING;

-- 创建同步触发器函数
CREATE OR REPLACE FUNCTION sync_public_user_to_auth_insert() 
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$ 
BEGIN 
    INSERT INTO auth.users (id) VALUES (NEW.auth_user_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sync_public_user_to_auth_update() 
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$ 
BEGIN 
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        UPDATE auth.users SET email = NEW.email WHERE id = NEW.auth_user_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sync_public_user_to_auth_delete() 
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$ 
BEGIN 
    DELETE FROM auth.users WHERE id = OLD.auth_user_id;
    RETURN OLD;
END;
$$;

-- 创建触发器
CREATE TRIGGER trigger_sync_public_user_to_auth_insert
AFTER INSERT ON "user" FOR EACH ROW EXECUTE FUNCTION sync_public_user_to_auth_insert();

CREATE TRIGGER trigger_sync_public_user_to_auth_update
AFTER UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION sync_public_user_to_auth_update();

CREATE TRIGGER trigger_sync_public_user_to_auth_delete
AFTER DELETE ON "user" FOR EACH ROW EXECUTE FUNCTION sync_public_user_to_auth_delete();

