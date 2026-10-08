# Minimal TeX Live installation, the needed packages get installed by the Dockerfile.
selected_scheme scheme-infraonly
TEXDIR /opt/texlive
TEXMFLOCAL /opt/texlive/texmf-local
TEXMFSYSCONFIG /opt/texlive/texmf-config
TEXMFSYSVAR /opt/texlive/texmf-var
TEXMFHOME ~/texmf
TEXMFCONFIG ~/.texlive/texmf-config
TEXMFVAR ~/.texlive/texmf-var
instopt_adjustpath 0
instopt_adjustrepo 0
tlpdbopt_autobackup 0
tlpdbopt_install_docfiles 0
tlpdbopt_install_srcfiles 0
