#!/bin/bash

# Changelog Update Script
# Usage: ./update-changelog.sh "Added new feature" "Added" "v1.1.0"

CHANGELOG_FILE="CHANGELOG.md"
TEMP_FILE="temp_changelog.md"

# Check if arguments are provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 \"Description\" \"Type\" [Version]"
    echo "Types: Added, Changed, Deprecated, Removed, Fixed, Security"
    echo "Example: $0 \"Added user authentication\" \"Added\" \"v1.1.0\""
    exit 1
fi

DESCRIPTION="$1"
TYPE="$2"
VERSION="${3:-Unreleased}"

# Validate type
case $TYPE in
    Added|Changed|Deprecated|Removed|Fixed|Security)
        ;;
    *)
        echo "Invalid type: $TYPE"
        echo "Valid types: Added, Changed, Deprecated, Removed, Fixed, Security"
        exit 1
        ;;
esac

# Get current date
DATE=$(date +%Y-%m-%d)

echo "Updating changelog..."
echo "Description: $DESCRIPTION"
echo "Type: $TYPE"
echo "Version: $VERSION"
echo "Date: $DATE"

# Create temporary file
cp "$CHANGELOG_FILE" "$TEMP_FILE"

# Check if version section exists
if grep -q "## \[$VERSION\]" "$TEMP_FILE"; then
    echo "Version $VERSION already exists in changelog"
    echo "Adding entry to existing version..."
    
    # Find the line after the version header and add the new entry
    awk -v type="$TYPE" -v desc="$DESCRIPTION" '
    /^## \['"$VERSION"'\].*/ {
        print $0
        getline
        print $0
        print "### " type
        print "- " desc
        next
    }
    { print }
    ' "$TEMP_FILE" > "$CHANGELOG_FILE"
else
    echo "Creating new version section for $VERSION..."
    
    # Add new version section after [Unreleased]
    awk -v version="$VERSION" -v date="$DATE" -v type="$TYPE" -v desc="$DESCRIPTION" '
    /^## \[Unreleased\]/ {
        print $0
        print ""
        print "## [" version "] - " date
        print ""
        print "### " type
        print "- " desc
        print ""
        next
    }
    { print }
    ' "$TEMP_FILE" > "$CHANGELOG_FILE"
fi

# Clean up
rm "$TEMP_FILE"

echo "✅ Changelog updated successfully!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff CHANGELOG.md"
echo "2. Commit the changes: git add CHANGELOG.md && git commit -m \"Update changelog: $DESCRIPTION\""
echo "3. Tag the version (if applicable): git tag $VERSION"
