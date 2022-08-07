import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { VpcStack } from './vpc-stack'
import { SgStack }  from './sg-stack'
import { EcsStack } from './ecs-stack'
import { Ec2Stack } from './ec2-stack';
import { AlbStack } from './alb-stack';
import { RdsStack } from './rds-stack';
import { ContextGetter } from './context-getter';

export class WpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // コンテキスト操作クラスをインスタンス化
    const stage = scope.node.tryGetContext('stage')
    const context = new ContextGetter(scope, stage)
    // SG 作成クラスをインスタンス化
    const sg = new SgStack(scope, context.getResouceName() + '-sg', props)

    // VPC 作成
    const vpc = new VpcStack(scope, context.getResouceName() + '-vpc', props).createVpc(context)
    // ALB 用 SG 作成
    const albSg = sg.createAlbSg(context, vpc)
    // ECS 用 SG 作成
    const ecsSg = sg.createEcsSg(context, vpc)
    // EC2 用 SG 作成
    const ec2Sg = sg.createEc2Sg(context, vpc, ecsSg)
    // // RDS 用 SG 作成
    const rdsSg = sg.createRdsSg(context, vpc, ecsSg, ec2Sg)

    // EC2 作成
    const fileSystemId = new Ec2Stack(scope, context.getResouceName() + '-ec2', props).createEC2(context, vpc, ec2Sg)

    // ECS 作成
    const service = new EcsStack(scope, context.getResouceName() + '-ecs', props).createEcs(context, vpc, ecsSg, fileSystemId)
    // ALB 作成
    new AlbStack(scope, context.getResouceName() + '-alb', props).createAlb(context, vpc, albSg, service, stage)

    // // RDS 作成
    new RdsStack(scope, context.getResouceName() + '-rds', props).createRds(context, vpc, rdsSg)
  }
}
