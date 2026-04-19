import { TextInput } from "@tremor/react";
import { SimpleTable } from "../../../shared/table/simpleTable";
import { ThemedSwitch } from "../../../shared/themed/themedSwitch";
import { getUSDate } from "../../../shared/utils/utils";
import { useState } from "react";

import useNotification from "../../../shared/notification/useNotification";
import { Button } from "@/components/ui/button";
import {
  useCreateAlertBanner,
  useUpdateAlertBanner,
} from "@/services/hooks/admin";
import { $JAWN_API } from "@/lib/clients/jawn";

interface AlertBannersProps {}

const AlertBanners = (props: AlertBannersProps) => {
  const {} = props;

  const { setNotification } = useNotification();

  const { data: alertBanners, refetch } = $JAWN_API.useQuery(
    "get",
    "/v1/alert-banner",
    {},
  );

  const { createBanner, isCreatingBanner } = useCreateAlertBanner(() => {
    refetch();
    setTitle("");
    setMessage("");
    setNotification("Alert banner created successfully", "success");
  });

  const { updateBanner } = useUpdateAlertBanner(() => {
    refetch();
    setNotification("Alert banner updated successfully", "success");
  });

  // states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <>
      <h2 className="text-lg font-semibold text-white">警告横幅</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <TextInput
            placeholder="标题"
            value={title}
            onValueChange={setTitle}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            placeholder="消息"
            value={message}
            onValueChange={setMessage}
          />
        </div>
        <div className="col-span-1">
          <Button
            size={"xs"}
            onClick={async () => {
              if (!title || !message) {
                setNotification("Title and message are required", "error");
                return;
              }
              createBanner({ title, message });
            }}
            disabled={isCreatingBanner}
          >
            Create new alert
          </Button>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-black">
        <SimpleTable
          data={alertBanners?.data || []}
          columns={[
            {
              key: "title",
              header: "标题",
              render: (row) => (
                <div className="font-semibold text-black">{row.title}</div>
              ),
            },
            {
              key: "message",
              header: "消息",
              render: (row) => <div className="text-wrap">{row.message}</div>,
            },
            {
              key: "created_at",
              header: "创建时间",
              render: (row) => (
                <div className="">{getUSDate(new Date(row.created_at))}</div>
              ),
            },
            {
              key: "updated_at",
              header: "最后更新",
              render: (row) => (
                <div className="">{getUSDate(new Date(row.updated_at))}</div>
              ),
            },
            {
              key: "active",
              header: "活跃",
              render: (row) => (
                <ThemedSwitch
                  checked={row.active}
                  onChange={function (checked: boolean): void {
                    updateBanner({ id: row.id, active: checked });
                  }}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default AlertBanners;
