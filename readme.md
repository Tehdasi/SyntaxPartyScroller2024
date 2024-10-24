So this is the source for my Syntax Party 2024 entry for the newschool demo compo.

To build:
1) install python (I used 3, 2 will prolly do) and PIL (pip install pillow).
2) edit b.bat (yeah, this is for windows) if you chrome application is somewhere else.
3) run b.bat, it should compile both the editor and the actual scroller, and then run the scroller in chrome.

Notes: 
- The build system was designed to be able to produce a single html file for release. 
- However that's a PITA when debugging since the source lines in the developer console don't match up, so pass in 'external' as the third arg to build.py to make the js be a script external to the index.html and remove this problem.
    - Yeah, this should also be an option to just move the src files to the build dir and that would make it even better. Oh well, maybe for the next ver.
- note how the scroller first goes to a brown screen first before getting to the actual demo? It's to get around browsers stopping music play back until the user has interacted with the page.
- The text functions seem to run like ass on Firefox, so, like use chrome?