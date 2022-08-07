import { Stack, StackProps, aws_ec2, aws_ecs, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class EcsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * ECS 作成
   *
   * @param context: ContextGetter
   * @param vpc: ec2.Vpc
   * @param ecsSg: ec2.SecurityGroup
   *
   * @returnse interface: FargateServiceProps
   */
  public createEcs(
    context: ContextGetter,
    vpc    : aws_ec2.Vpc,
    ecsSg  : aws_ec2.SecurityGroup,
    fileSystemId: string
  ){
    // Cluster 作成
    const cluster = new aws_ecs.Cluster(this, 'cluster', {
      // Cluster 作成 VPC
      vpc: vpc,
      // Cluster 名
      clusterName: context.getResouceName()
    });

    // Fargate タスク 作成
    const task = new aws_ecs.FargateTaskDefinition(this, 'task', {
      // ファミリー名
      family: context.getResouceName(),
      // CPU サイズ
      cpu:    context.getEcsFargateCpu(),
      // メモリサイズ
      memoryLimitMiB: context.getEcsFargateMemory(),
    });
    // ボリューム設定
    task.addVolume({
      // ボリューム名
      name: context.getResouceName(),
      // efs 指定
      efsVolumeConfiguration: {
        fileSystemId: fileSystemId,
        rootDirectory: context.getResouceName()
      }
    });
    // efs 操作権限
    task.addToTaskRolePolicy(
      new aws_iam.PolicyStatement({
        actions: [
          'elasticfilesystem:ClientRootAccess',
          'elasticfilesystem:ClientWrite',
          'elasticfilesystem:ClientMount',
          'elasticfilesystem:DescribeMountTargets',
        ],
        resources: [`arn:aws:elasticfilesystem:${this.region}:${this.account}:file-system/${fileSystemId}`],
      })
    );

    // ECR 独自イメージを利用する場合はコメントアウト削除
    // task.addToTaskRolePolicy(
    //   new aws_iam.PolicyStatement({
    //     actions: [
    //       "ecr:GetAuthorizationToken",
    //       "ecr:BatchCheckLayerAvailability",
    //       "ecr:GetDownloadUrlForLayer",
    //       "ecr:BatchGetImage"
    //     ],
    //     resources: [`*`],
    //   })
    // );

    // コンテナ設定
    const container = task.addContainer('container', {
      // コンテナイメージ
      image : aws_ecs.ContainerImage.fromRegistry(context.getEcsImage()),
      // コンテナ名
      containerName: 'main'
    });
    // ポートマッピング
    container.addPortMappings({
      // コンテナポート
      containerPort: 80,
      protocol: aws_ecs.Protocol.TCP,
    });
    // マウントポイント
    container.addMountPoints({
      // コンテナパス
      containerPath: '/var/www/html',
      sourceVolume: context.getResouceName(),
      readOnly: false
    });

    // サービス
    const service = new aws_ecs.FargateService(this, 'service', {
      // サービス起動クラスタ
      cluster,
      // サービス名
      serviceName: context.getResouceName(),
      // 起動タスク
      taskDefinition: task,
      // パブリック IP 利用設定
      assignPublicIp: false,
      // 起動タスク数
      desiredCount: 1,
      // exec コマンド利用設定
      enableExecuteCommand: true,
      // ヘルスチェック猶予期間
      healthCheckGracePeriod: cdk.Duration.seconds(300),
      // セキュリティグループ
      securityGroups: [ ecsSg ],
      // 配置サブネット
      vpcSubnets: vpc.selectSubnets({ subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT }),
    });
    return service;
  }
}