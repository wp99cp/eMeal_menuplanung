from pylatex import Package
from pylatex.base_classes import Environment


class Sidewaystable(Environment):
    packages = [Package('rotating')]
    escape = False
    content_separator = "\n"


class Makebox(Environment):
    escape = False
    content_separator = "\n"


class Landscape(Environment):
    pass


class Multicols(Environment):
    escape = False
    content_separator = "\n"


class Spacing(Environment):
    escape = False
    content_separator = "\n"
