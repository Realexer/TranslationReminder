cd /Users/alexeyskrypnik/Projects/TranslationReminder/
rm -r deploy/chrome/*
cp -r src/Chrome/* deploy/chrome/
cp -r src/src/src/* deploy/chrome/
open "http://reload.extensions"