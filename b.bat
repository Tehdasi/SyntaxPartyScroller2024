@python build2.py src\scroller.js outscroller internal
@python build2.py src\editor.js outeditor internal

@"c:\Program Files\Google\Chrome\Application\chrome.exe" file://c:/coding/scroller2024/outscroller/index.html
@rem "c:\Program Files\Google\Chrome\Application\chrome.exe" file://c:/coding/scroller2024/outeditor/index.html