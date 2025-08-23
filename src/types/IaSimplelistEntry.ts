
export type IaSimplelistEntry = {
    notes: Record<string, any>,
    sys_changed_by: {
        source: string,
        username?: string;
        task_id?: string
    },
    sys_last_changed: string;
};

export type IaSimplelistEntries = { [key: string]: IaSimplelistEntry; };