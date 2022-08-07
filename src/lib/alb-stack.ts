import { Stack, StackProps, aws_ec2, aws_ecs, aws_s3 } from 'aws-cdk-lib';
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class AlbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * Application Load Blancer, Target Group 作成
   *
   * @param context: ContextGetter
   * @param vpc:     aws_ec2.Vpc
   * @param albSg:   aws_ec2.SecurityGroup
   * @param service: aws_ecs.FargateService
   * @param stage:   string
   */
  public createAlb(
    context: ContextGetter,
    vpc    : aws_ec2.Vpc,
    albSg  : aws_ec2.SecurityGroup,
    service: aws_ecs.FargateService,
    stage  : string
  ){
    // Application Load Blancer 作成
    const alb = new elbv2.ApplicationLoadBalancer(this, 'applicationloadblancer', {
      // ALB 作成 VPC
      vpc: vpc,
      // ALB 作成サブネット指定
      vpcSubnets: { subnets: vpc.publicSubnets },
      // スキーマ設定
      internetFacing: true,
      // アイドルタイムアウト設定
      idleTimeout: cdk.Duration.seconds(context.getAlbIdleTimeout()),
      // ALB 名
      loadBalancerName: context.getResouceName(),
      // セキュリティグループ設定
      securityGroup: albSg
    });
    // ALB ターゲットグループ作成
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'targetgroup', {
      // ターゲット作成 VPC
      vpc: vpc,
      // ターゲットポート
      port: 80,
      // ターゲット
      targets: [service],
      // ターゲットプロトコル
      protocol: elbv2.ApplicationProtocol.HTTP,
      // ターゲットタイプ
      targetType: elbv2.TargetType.IP,
      // ターゲットグループ名
      targetGroupName: context.getResouceName(),
      // ヘルスチェック設定
      healthCheck: {
        healthyHttpCodes: '200',
        healthyThresholdCount: 2,
        interval: cdk.Duration.seconds(30),
        path: '/readme.html',
        timeout: cdk.Duration.seconds(5),
        unhealthyThresholdCount: 2,
      }
    });
    // HTTP リスナー作成 http => https リダイレクト設定
    alb.addListener('http', {
      // リスナー設定
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup]
    }).addAction('http', {
      // リスナールール作成
      priority: 1,
      // リスナーコンディション
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/*']),
      ],
      // リダイレクトルール
      action: elbv2.ListenerAction.redirect({
        port: '443',
        protocol: elbv2.ApplicationProtocol.HTTPS,
      })
    })
    // HTTPS リスナー作成
    alb.addListener('https', {
      // リスナー設定
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [
        elbv2.ListenerCertificate.fromArn(context.getAlbCertificateArn())
      ],
      defaultTargetGroups: [targetGroup]
    })
    // ALB ログ出力設定
    alb.logAccessLogs(
      // ログ出力バケット
      new aws_s3.Bucket(this, 's3loggingbucket', {
        bucketName: context.getS3BucketName()
      }),
      // prefix
      stage
    );
  }
}