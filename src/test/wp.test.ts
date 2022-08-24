import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { WpStack } from '../lib/wp-stack';
import cdkJson from './cdk.test.json';

test("snapshot test", () => {
  const app = new cdk.App({context: cdkJson["context"]});
  const stack = new WpStack(app, 'test-wp', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region:  process.env.CDK_DEFAULT_REGION,
    },
  });
  // テンプレート作成
  const template = Template.fromStack(stack);
  // スナップショット検証
  expect(template.toJSON()).toMatchSnapshot();
});
