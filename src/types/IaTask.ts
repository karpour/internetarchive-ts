export const IaTaskTypes = [
    "book_op.php",
    "bup.php",
    "delete.php",
    "derive.php",
    "fixer.php",
    "make_dark.php",
    "make_undark.php",
    "rename.php"
] as const;

export type IaTaskType = typeof IaTaskTypes[number];

export const IaTaskPriorities = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type IaTaskPriority = typeof IaTaskPriorities[number];

// TODO
export type IaTaskSummary = any;