#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WpStack } from '../lib/wp-stack';

import { ContextGetter } from '../lib/context-getter'

const app = new cdk.App();

// cdk 実行時にデプロイ対象のステージをパラメータで指定
// パラメータの妥当性チェックを行う
const stage = app.node.tryGetContext('stage')
const stagekinds: Array<string> = ['stg', 'prod']
if (undefined == stage || !stagekinds.includes(stage)) {
    console.log('stage パラメータを指定してね！\nex: cdk deploy -c stage=stg')
    process.exit(9)
};
const context = new ContextGetter(app, stage);

new WpStack(app, context.getResouceName() + '-stack', {
    env: {
        // docker-compose 起動時の .env から注入された環境変数を利用
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region:  process.env.CDK_DEFAULT_REGION,
    },
});