import { Tooltip } from 'antd';
import { QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

export function Version() {
  if (IS_DEV_SERVER === true) {
    return <>running on Development Server&nbsp;<Tooltip title={`${GIT_REF_TYPE}/${GIT_REF}+${GIT_SHA?.substring(0, 7)}`}><InfoCircleOutlined /></Tooltip></>;
  }

  if (!GIT_SHA) {
    return <>Unknown Version<Tooltip title="No version information exist for this build"><QuestionCircleOutlined /></Tooltip></>;
  }

  if (GIT_IS_DIRTY && GIT_IS_DIRTY === true) {
    return <>Development Version&nbsp;<Tooltip title={`Git has detected changes at commit ${GIT_SHA}\n(ref: ${GIT_REF_TYPE}/${GIT_REF})`}><QuestionCircleOutlined /></Tooltip></>;
  }

  const versionInfo = GIT_REF && GIT_REF_TYPE === "tag" ? `v${GIT_REF.replace(/^v/i, "")}` : `Test build from branch ${GIT_REF}`;
  return <>{versionInfo}&nbsp;<Tooltip title={<><div>Built from version control</div><div>{`(reference: ${GIT_SHA.substring(0, 7)})`}</div></>}><InfoCircleOutlined /></Tooltip></>;
}
