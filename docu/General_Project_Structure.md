# General Project Structure

eMeal Menüplanung consists of different components; a frontend written in Angular and different backend modules.

The backend modules can be divided into the database ([Cloud Firestore](https://firebase.google.com/docs/firestore), a NoSQL Database), the file storage ([Cloud Storage for Firebase](https://firebase.google.com/docs/storage), used for storing the pdf files), a collection of lightweight cloud services (written as [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) with TypeScript) and the PDF export module (a docker container, using a LaTeX compiler and some logic written in python to create a tex file).

The hosted instance [eMeal.zh11.ch](eMeal.zh11.ch) is hosted on [Firebase Hosting](https://firebase.google.com/docs/hosting) and automatically build and deployed form the master branch of this project (see [Continuous Integration and General Tests](/docu/Continuous_Integration_And_General_Tests.md)). You can host your own incance by changing/adding your API-keys respectively your project-ids to each of component (including backends, frontend components).


## Git / GitHub Setup for eMeal
This project using continuous integration (CI) with github actions. 
See [Continuous Integration and General Tests](/docu/Continuous_Integration_And_General_Tests.md).

### General Guidelines and Branch Structure
In general, we follow the model as described in https://nvie.com/posts/a-successful-git-branching-model/.

We distinguish between the following branches:
 * **master**
 
    release version deployed on webpage (will never be deleted).
 
    _"Therefore,  each time when changes are merged back into master, this is a new production release by definition.
    We tend to be very strict at this, so that theoretically, we could use a Git hook script to automatically 
    build and roll-out our software to our production servers everytime there was a commit on master."_
    
 * **hotfix/*** (e.g., hotfix/v1.2.1)
 
    hotfixes based in the master branch (will be deleted after merge to master)
 
 * **release/*** (e.g., release/v1.2.0)
 
    branch for release (will be deleted after merge to master and develop)
 
    _"The key moment to branch off a new release branch from develop is when develop (almost) 
    reflects the desired state of the new release. At least all features that are targeted for 
    the release-to-be-built must be merged in to develop at this point in time. All features targeted 
    at future releases may not—they must wait until after the release branch is branched off."_
    
 * **develop**
 
    used for development of the next version, bug fixes (will never be deleted)
 
    _"We consider origin/develop to be the main branch where the source code of HEAD always reflects a 
    state with the latest delivered development changes for the next release. Some would call this the 
    “integration branch”. This is where any automatic nightly builds are built from."_
 
 * **feature/*** (e.g., release/my-feature)
 
    for new features experiments  (will be deleted after merge to develop)
 
![project structure](https://nvie.com/img/git-model@2x.png)

#### Creating a feature branch 

    $ git checkout -b feature/my-feature develop
    Switched to a new branch "feature/my-feature"
    
Can be done with Github Desktop: 
    
    Branch >> New branch... >> Select develop >> Create branch

#### Incorporating a finished feature on develop

    $ git checkout develop
    Switched to branch 'develop'
    
    $ git merge --no-ff feature/my-feature
    Updating ea1b82a..05e9557
    (Summary of changes)
    
    $ git branch -d feature/my-feature
    Deleted branch my-feature (was 05e9557).
    
    $ git push origin develop
    
Can be done with Github Desktop: 

    Change current branch to develop
    Branch >> Merge into current branch >> select the correct feature branch >> Merge
    
    select the merged feature branch
    Branch >> Delete ... (select the fetaure branch, make shure to delete also the remote branch)

#### Creating a release branch 

    $ git checkout -b release/v1.2.0 develop
    Switched to a new branch "release/v1.2.0"
    
    $ ./bump-version.sh 1.2.0
    Files modified successfully, version bumped to v1.2.0.
    
    $ git commit -a -m "Bumped version number to v1.2.0"
    [release-1.2 74d9424] Bumped version number to v1.2.0
    1 files changed, 1 insertions(+), 1 deletions(-)
    
Should be done with command line, can only be partly done with Github Desktop.


#### Finishing a release branch

Must be done with a pull request! We do not allwo direct commits to the master branch.

With Github Desktop:

    Branch >> Create Pull Request
    
The pull request title and description are published on the application.
They should be descriptive and not to technical.
See [Version Controlling and Release Notes Guidelines](/docu/Version_Controlling_and_Release_Notes_Guidelines.md)

    
Wait until all test succeeded.

    On Github:  Select "Merge" and add the final release notes.
    On Github: Delete the release branch
    On Github: Create a new Release

Merge release to develop.
    
    $ git checkout develop
    Switched to branch 'develop'
    
    $ git merge --no-ff origin/master
    Merge made by recursive.
    (Summary of changes)
    
    
#### Creating the hotfix branch
    
    $ git checkout -b hotfix/v1.2.1 master
    Switched to a new branch "hotfix-1.2.1"
    
    $ ./bump-version.sh 1.2.1
    Files modified successfully, version bumped to 1.2.1.
    
    $ git commit -a -m "Bumped version number to 1.2.1"
    [hotfix-1.2.1 41e61bb] Bumped version number to 1.2.1
    1 files changed, 1 insertions(+), 1 deletions(-)
    
    
#### Finishing a hotfix branch

The one exception to the rule here is that, when a release branch currently exists, 
the hotfix changes need to be merged into that release branch, instead of!

    $ git checkout master
    Switched to branch 'master'
    
    $ git merge --no-ff hotfix/v1.2.1
    Merge made by recursive.
    (Summary of changes)
    
    $ git tag -a v1.2.1
    
    $ git checkout develop
    Switched to branch 'develop'
    
    $ git merge --no-ff hotfix/v1.2.1
    Merge made by recursive.
    (Summary of changes)
    
    $ git branch -d hotfix/v1.2.1
    Deleted branch hotfix-1.2.1 (was abbe5d6).

This project using continuous integration (CI) with github actions.

### Apply the following settings on Github
We use the following settings for our project:

* in https://github.com/wp99cp/github_setup/settings
    - "Merge button": select only "Allow merge commits"
    - check "Automatically delete head branches"
    
* in https://github.com/wp99cp/github_setup/settings/security_analysis
    - check: "Dependency graph", "Dependabot alerts", and "Dependabot security updates"
    
* in https://github.com/wp99cp/github_setup/settings/branches
    - add protecting rules to master and develop branch

