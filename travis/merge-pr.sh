test_level() {
    APEX_TESTS=$(xq . < package/package.xml | jq -r '.Package.types | [.] | flatten | map(select(.name=="ApexClass")) | .[] | .members | [.] | flatten | map(select(. | index("*") | not)) | unique | join(" ")')
    if [ -n "$APEX_TESTS" ]
    then
     TEST_LEVEL="--test-level RunSpecifiedTests --tests $APEX_TESTS"
    else
     TEST_LEVEL=""
    fi
}

sf sgd source delta --to "HEAD" --from "HEAD~1" --output "." --source force-app
if grep -q '<types>' package/package.xml ; then
    test_level
    sf project deploy start --manifest package/package.xml $TEST_LEVEL -o target_org --verbose
else
    echo "There are no changes to validate"
fi
