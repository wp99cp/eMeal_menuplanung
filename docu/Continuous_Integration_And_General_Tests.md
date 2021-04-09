
# Continuous Integration and General Tests
This is a description of the tests and actions that are performed automatically. 
 
## Actions on a Pull Request to Master
 
### Version Checking
_(Test name: check-version-number)_

Checks if the version number has been increased since the last commit to the master branch. Checks if 
the version number of the different components are identical. Adds a corresponding label to the pull request.

