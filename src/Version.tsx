import { Tooltip } from "antd";
import { QuestionCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { env } from "~/env";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export function Version() {
  if (env.NEXT_PUBLIC_IS_DEV_SERVER === true) {
    return (
      <HoverCard>
        <HoverCardTrigger>running on Development Server&nbsp;</HoverCardTrigger>
        <HoverCardContent>{`${env.NEXT_PUBLIC_GIT_REF_TYPE}/${env.NEXT_PUBLIC_GIT_REF}+${env.NEXT_PUBLIC_GIT_SHA?.substring(0, 7)}`}</HoverCardContent>
      </HoverCard>
    );
  }

  if (!env.NEXT_PUBLIC_GIT_SHA) {
    return (
      <>
        Unknown Version
        <Tooltip title="No version information exist for this build">
          <QuestionCircleOutlined />
        </Tooltip>
      </>
    );
  }

  if (env.NEXT_PUBLIC_GIT_IS_DIRTY && env.NEXT_PUBLIC_GIT_IS_DIRTY === true) {
    return (
      <>
        Development Version&nbsp;
        <Tooltip
          title={`Git has detected changes at commit ${env.NEXT_PUBLIC_GIT_SHA}\n(ref: ${env.NEXT_PUBLIC_GIT_REF_TYPE}/${env.NEXT_PUBLIC_GIT_REF})`}
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </>
    );
  }

  const versionInfo =
    env.NEXT_PUBLIC_GIT_REF && env.NEXT_PUBLIC_GIT_REF_TYPE === "tag"
      ? `v${env.NEXT_PUBLIC_GIT_REF.replace(/^v/i, "")}`
      : `Test build from branch ${env.NEXT_PUBLIC_GIT_REF}`;
  return (
    <>
      {versionInfo}&nbsp;
      <Tooltip
        title={
          <>
            <div>Built from version control</div>
            <div>{`(reference: ${env.NEXT_PUBLIC_GIT_SHA.substring(0, 7)})`}</div>
          </>
        }
      >
        <InfoCircleOutlined />
      </Tooltip>
    </>
  );
}
