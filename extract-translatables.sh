#
# Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file LICENSE for license information (GPL3). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --
#

find ./src/ -regex ".*\.\(ts\|marko\)" | xargs grep -Pohw "(?<=(['\"]))Translatable#.+?(?=\1)" -0 | sort --unique | awk -F "Translatable#" '{print "msgid \""$2"\"\nmsgstr \"\""}' > ./locale/templates.pot && sed -i -e 's/Translatable#//g' ./locale/templates.pot