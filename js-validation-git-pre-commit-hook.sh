#!/bin/bash -
###############################################################################
# File:          js-validation-git-pre-commit-hook.sh
#
# Description:   Git pre-commit that checks your code for js errors before you commit it
#
# Prerequisites: jshint to install run: "npm install jshint -g"
#
# Instructions:  Place this file in your project's .git/hooks renamed to "pre-commit"
#                run: "chmod +x .git/hooks/pre-commit"
#
# Todo:          -List files that do not pass validation
#                -Attempt to fix files with fixmyjs command
#
# Author:        John Tregoning
###############################################################################

if git rev-parse --verify HEAD >/dev/null 2>&1
then
    against=HEAD
else
    # Initial commit: diff against an empty tree object
    against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi

EXIT_CODE=0

# Show files about to be commited that do not match filters in .jshintignore and are js files
for FILE in `git diff-index --name-only --cached --diff-filter=ACMRTX ${against} -- | grep -v -f .jshintignore | grep \.js$ -i`; do
    jshint ${FILE} >> /dev/null
    EXIT_CODE=`expr ${EXIT_CODE} + $?`
done

if [[ ${EXIT_CODE} -ne 0 ]]; then
    echo ""
    echo " ----------------------------------------------- "
    echo "|         * * * E P I C    F A I L * * *        |"
    echo "|                                               |"
    echo "| Some files do not pass JavasScript validation |"
    echo "| run: 'jshint .' to find out more              |"
    echo "|                                               |"
    echo "| Git commit has been aborted.                  |"
    echo " ----------------------------------------------- "
    echo ""
fi

exit $((${EXIT_CODE}))