# Optional arguments for the camp export

This document contains a list of the settings for the pdf-export.

Name | arguments | Description
--- | --- | ---
|  |
`--dfn` | `None` | Uses the default name `/export.pdf` to save the created file
|  |
`--wv`| `None` | Includes the weekview
`--lscp` | `None` | Prints the weekview in landscape, i.g. rotates the page in the pdf
`--mp` |  `None` | Shows a column in the weekview containing all meals that must get prepared at the corresponding day.
|  |
`--fdb`| `None` | Includes a feedback form page for the participants of the camp
`--fdbmsg` | `String`| Custom feedback message printed on the feedback page. Only available with `--fdb`
|  |
`--spl`| `None` | Includes the shopping list
`--meals`| `None` | Includes all meals
`--ncols` | `[1-3]` | Number of columns in shopping list
| |
`--invm`| `None` | Invert order of the ingredients and measurement in the shopping-list. Default "2kg Mehl" or with this flag "Mehl, 2kg".
`--minNIng` | `Integer` | Minimal number of ingredients per category. If the number of ingredients in a category is below this threshold, they get listed onder "Diverses" in the shopping list.