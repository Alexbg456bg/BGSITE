@echo off
cd /d "%~dp0"
call ".\node_modules\.bin\vite.cmd" --configLoader native --host 0.0.0.0
