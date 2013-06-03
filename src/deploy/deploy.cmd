@ECHO OFF
cd ..\..\src
"C:\Program Files\WinRAR\winrar.exe" a MyApp.oex . -r -x '*.git/*' -x '*nbproject*'
start MyApp.oex
:: pause