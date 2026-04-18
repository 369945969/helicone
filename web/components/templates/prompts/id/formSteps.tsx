export default function 表单步骤s(props: {
  current步骤: number;
  setCurrent步骤: (id: number) => void;
}) {
  const { current步骤, setCurrent步骤 } = props;
  const get步骤Status = (stepIdx: number) => {
    if (stepIdx === current步骤) {
      return "current";
    }
    if (stepIdx < current步骤) {
      return "complete";
    }
    return "upcoming";
  };

  const steps = [
    {
      id: "步骤 1",
      name: "配置ure 实验",
      href: "#",
      status: get步骤Status(0),
    },
    {
      id: "步骤 2",
      name: "Edit 提示词",
      href: "#",
      status: get步骤Status(1),
    },
    {
      id: "步骤 3",
      name: "Confirm",
      href: "#",
      status: get步骤Status(2),
    },
  ];

  return (
    <nav aria-label="进度">
      <ol role="list" class名称="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => (
          <li key={step.name} class名称="md:flex-1">
            {step.status === "complete" ? (
              <button
                onClick={() => {
                  setCurrent步骤(steps.indexOf(step));
                }}
                class名称="group flex w-full flex-col border-l-4 border-sky-500 py-2 pl-4 hover:border-sky-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span class名称="text-sm font-medium text-sky-500 group-hover:text-sky-800">
                  {step.id}
                </span>
                <span class名称="text-sm font-medium">{step.name}</span>
              </button>
            ) : step.status === "current" ? (
              <button
                onClick={() => {
                  setCurrent步骤(steps.indexOf(step));
                }}
                class名称="flex w-full flex-col border-l-4 border-sky-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                aria-current="step"
              >
                <span class名称="text-sm font-medium text-sky-500">
                  {step.id}
                </span>
                <span class名称="text-sm font-medium">{step.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrent步骤(steps.indexOf(step));
                }}
                class名称="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span class名称="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                  {step.id}
                </span>
                <span class名称="text-sm font-medium">{step.name}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
