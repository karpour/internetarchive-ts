export type IaXisbn = {
    stat: "ok" | string,
    list: IaXisbnEntry[];
};

export type IaXisbnEntry = {
    url: string | string[],
    publisher: string | string[],
    form: string | string[],
    lccn: string | string[],
    lang: string,
    city: string,
    author: string | string[],
    ed: string | string[],
    year: `${number}`,
    isbn: string | string[],
    title: string,
    oclcnum: string | string[],
    [key: string]: string | string[],
};

const example: IaXisbn = {
    "stat": "ok",
    "list": [
        {
            "url": [
                "http://www.worldcat.org/oclc/41752477?referer=xid"
            ],
            "publisher": "F & W Associates",
            "form": [
                "BC"
            ],
            "lccn": [
                "94212387"
            ],
            "lang": "eng",
            "city": "San Jose, Calif.",
            "author": "Scott Piepenburg.",
            "ed": "3d ed.",
            "year": "1999",
            "isbn": [
                "0965212629"
            ],
            "title": "Easy MARC : a simplified guide to creating catalog records for library automation systems incorporating format integration",
            "oclcnum": [
                "41752477",
                "557949317",
                "50680759"
            ]
        }
    ]
};