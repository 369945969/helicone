import { CheckIcon } from "lucide-react";
import { ContactCTA } from "./contactCTA";
import { UpgradeToProCTA } from "./upgradeToProCTA";

export const PricingCompare = ({
  featureName = "",
}: {
  featureName: string;
}) => {
  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        免费计划每月仅提供 10,000 次请求，但获取更多请求很容易。
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">免费</h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
            当前计划
          </span>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              每月 10k 免费请求
            </li>
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              访问仪表板
            </li>
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              Free, truly
            </li>
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Pro</h3>
          <span className="text-sm">$20/user</span>
          <p className="mt-2 text-sm">Everything in Free, plus:</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              Limitless requests (first 100k free)
            </li>
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              Access to all features
            </li>
            <li className="flex items-center text-sm">
              <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              Standard support
            </li>
          </ul>
          <a href="#" className="mt-2 block text-sm text-blue-600">
            See all features →
          </a>
          <UpgradeToProCTA
            defaultPrompts={featureName === "Prompts"}
            showAddons={featureName === "Prompts"}
          />
        </div>
      </div>
      <ContactCTA />
    </>
  );
};
