# Change Log

All notable changes to the "lldbvisualizer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release (0.0.1)
- Fixed bug that attempted to write to a memory snapshot file that did not exist (0.0.2)
- Fixed bug that would causes a socket error if the extension was opened more than once in a short period of time (0.0.3)
- Improved print output to no longer wait on select calls (0.1.0)
- Updated webview location opening and sizing (0.1.1)
- Fixed bug that did not include build folder with extension output (0.1.2)