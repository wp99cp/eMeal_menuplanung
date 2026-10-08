from argparse import Namespace
from typing import Annotated, Mapping

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

# Ids of firestore documents and firebase users, e.g. 16fXu6siwVDX1OOb38P3 or CeviDB-0123456789abcdef01-42.
# The ids are part of database paths and of the name of the exported file.
DocumentId = Annotated[str, StringConstraints(pattern=r'^[A-Za-z0-9_-]{1,128}$')]


class ExportArgs(BaseModel):
    """
    The settings of an export, see utils/commandline_args_parser.py for their meaning. Unknown
    settings and values outside of the listed ranges are rejected.
    """

    model_config = ConfigDict(extra='forbid')

    user_id: DocumentId
    camp_id: DocumentId

    mp: bool = False
    lscp: bool = False
    fdb: bool = False
    wv: bool = False
    spl: bool = False
    meals: bool = False
    invm: bool = False

    fdbmsg: str = Field(default='', max_length=1000)
    ncols: int = Field(default=2, ge=1, le=4)
    minNIng: int = Field(default=2, ge=0, le=1000)


class DebugExportArgs(ExportArgs):
    """
    Settings that are only available on the command line, not for a request.
    """

    mock_data: bool = False
    dfn: bool = False


def validate_args(args: Namespace) -> Namespace:
    """
    :param args: the parsed command line arguments
    :return: the validated arguments
    :raises ValidationError: if an argument is invalid
    """

    return Namespace(**DebugExportArgs.model_validate(vars(args)).model_dump())


def parse_request_args(user_id: str, camp_id: str, query: Mapping[str, str]) -> Namespace:
    """

    Validates the arguments of an export request. The settings are passed as query parameters
    named like the command line arguments, e.g. `?--wv&--spl&--ncols=3`.

    :param query: the query parameters of the request
    :return: the validated arguments, with the same fields as the parsed command line arguments
    :raises ValidationError: if an argument is unknown or invalid

    """

    settings = {}
    for name, value in query.items():
        name = name.removeprefix('--')
        field = ExportArgs.model_fields.get(name)

        # a flag is set by its presence: `?--wv` and `?--wv=`
        is_flag = field is not None and field.annotation is bool
        settings[name] = True if is_flag and value == '' else value

    # the ids are set last, they can not be overwritten by a query parameter
    args = ExportArgs.model_validate({**settings, 'user_id': user_id, 'camp_id': camp_id})

    return Namespace(mock_data=False, dfn=False, **args.model_dump())
