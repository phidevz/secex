import { Tooltip } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function UserIds(props: { userIds: string[] }) {
    const { t } = useTranslation();
    const { userIds } = props;

    if (userIds.length === 0) {
        // TODO: check length > 0
    }

    const firstUserId = userIds[0];
    const remainder = useMemo(() => userIds.slice(1), [userIds]);

    const additionalUserIds = useMemo(() => remainder.map(userId => <div className="additional-userid" key={userId}>{userId}</div>), [remainder]);

    if (remainder.length === 0) {
        return <>'{firstUserId}'</>;
    }

    const moreNameLabel = remainder.length === 1 ? t('OneMoreName') : `${remainder.length} ${t('MoreNames')}`;

    return <>'{firstUserId}' ({t('and')} <Tooltip className="userids-more-names" placement="right" title={<div className="additional-userids">{additionalUserIds}</div>}><span>{moreNameLabel}</span></Tooltip>)</>;
}