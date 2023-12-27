import { Button } from "@/components/ui/button";
import { useAdminPerms } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { PlayerHistoryItem, PlayerModalSuccess } from "@shared/playerApiTypes";
import { PlayerModalMidMessage } from "./PlayerModal";


type HistoryItemProps = {
    action: PlayerHistoryItem,
    permsDisableWarn: boolean,
    permsDisableBan: boolean,
    serverTime: number,
}

function HistoryItem({ action, permsDisableWarn, permsDisableBan, serverTime }: HistoryItemProps) {
    const isRevokeDisabled = (
        !!action.revokedBy ||
        (action.type === 'warn' && permsDisableWarn) ||
        (action.type === 'ban' && permsDisableBan)
    );
    const actionDate = (new Date(action.ts * 1000)).toLocaleString();

    let footerNote, borderColorClass, actionMessage;
    if (action.type == 'ban') {
        borderColorClass = 'border-destructive';
        actionMessage = `BANNED by ${action.author}`;
    } else if (action.type == 'warn') {
        borderColorClass = 'border-warning';
        actionMessage = `WARNED by ${action.author}`;
    }
    if (action.revokedBy) {
        borderColorClass = '';
        footerNote = `Revoked by ${action.revokedBy}.`;
    }
    if (typeof action.exp == 'number') {
        const expirationDate = (new Date(action.exp * 1000)).toLocaleString();
        footerNote = (action.exp < serverTime) ? `Expired at ${expirationDate}.` : `Expires at ${expirationDate}.`;
    }

    return (
        <div className={cn('pl-2 border-l-4 hover:bg-muted rounded-r-sm', borderColorClass)}>
            <div className="flex w-full justify-between">
                <strong className="text-sm text-muted-foreground">{actionMessage}</strong>
                <small className="text-right text-xxs space-x-1">
                    <span className="font-mono">({action.id})</span>
                    <span className="opacity-75">{actionDate}</span>
                    <Button
                        variant="outline"
                        size='inline'
                        disabled={isRevokeDisabled}
                        onClick={() => { }}
                    >Revoke</Button>
                </small>
            </div>
            <span className="text-sm">{action.reason}</span>
            {footerNote && <small className="block text-xxs opacity-75">{footerNote}</small>}
        </div>
    );
}


type HistoryTabProps = {
    actionHistory: PlayerHistoryItem[],
    serverTime: number,
}

export default function HistoryTab({ actionHistory, serverTime }: HistoryTabProps) {
    const { hasPerm } = useAdminPerms();
    const hasWarnPerm = hasPerm('players.warn');
    const hasBanPerm = hasPerm('players.ban');

    if (!actionHistory.length) {
        return <PlayerModalMidMessage>
            No bans/warns found.
        </PlayerModalMidMessage>;
    } else {
        return <div className="flex flex-col gap-1 p-1">
            {actionHistory.map((action) => (
                <HistoryItem
                    key={action.id}
                    action={action}
                    permsDisableWarn={!hasWarnPerm}
                    permsDisableBan={!hasBanPerm}
                    serverTime={serverTime}
                />
            ))}
        </div>;
    }
}