
// TODO What does this do again?

export type IaXisbn = {
    stat: "ok" | string,
    list: IaXisbnEntry[];
};

export type IaXisbnEntry = {
    url: string | string[],
    publisher: string | string[],
    form: string | string[],
    lccn?: string | string[],
    lang: string,
    city: string,
    author: string | string[],
    ed?: string | string[],
    year: `${number}`,
    isbn: string | string[],
    title: string,
    oclcnum: string | string[],
    [key: string]: string | string[] | undefined,
};
