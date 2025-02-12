
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

// https://ia904507.us.archive.org/17/items/easymarc00scot/easymarc00scot_xisbn.json
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

let test: IaXisbn  = {
    "stat": "ok",
    "list": [
        {
            "url": [
                "http:\/\/www.worldcat.org\/oclc\/4128493?referer=xid"
            ],
            "publisher": "Atheneum",
            "form": [
                "BA"
            ],
            "lccn": [
                "78152044"
            ],
            "lang": "eng",
            "city": "New York",
            "author": "Carl Bridenbaugh.",
            "ed": "1st Atheneum pbk. ed.",
            "year": "1976",
            "isbn": [
                "0689705344"
            ],
            "title": "Fat mutton and liberty of conscience : society in Rhode Island, 1636-1690",
            "oclcnum": [
                "4128493",
                "466349680",
                "6066278",
                "730964000",
                "803233939"
            ]
        },
        {
            "url": [
                "http:\/\/www.worldcat.org\/oclc\/245795534?referer=xid"
            ],
            "publisher": "Faber and Faber",
            "form": [
                "BA"
            ],
            "lang": "eng",
            "city": "London",
            "author": "George Steiner.",
            "year": "1972",
            "isbn": [
                "0571097987"
            ],
            "title": "Extraterritorial : papers on literature and the language revolution",
            "oclcnum": [
                "245795534",
                "462738208",
                "5953546",
                "751297386",
                "803090541",
                "860291849"
            ]
        }
    ]
};