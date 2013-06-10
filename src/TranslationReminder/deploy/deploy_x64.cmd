@ECHO OFF
cd ..\..\src
"C:\Program Files (x86)\WinRAR\winrar.exe" a MyApp.oex -r
start MyApp.oex
:: pause