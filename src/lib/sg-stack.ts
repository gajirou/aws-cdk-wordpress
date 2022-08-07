import { Stack, StackProps, aws_ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class SgStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * ALB 用 SecurityGroup 作成
   *
   * @param context: ContextGetter
   * @param vpc:     aws_ec2.Vpc
   *
   * @returnse interface: SecurityGroupProps
   */
  public createAlbSg(context: ContextGetter, vpc: aws_ec2.Vpc) {
    const albSecurityGroup = new aws_ec2.SecurityGroup(this, 'albsecuritygroup', {
      // SecurityGroup 作成　VPC
      vpc: vpc,
      // 全ての Outbound を許可
      allowAllOutbound: true,
      // SG 名称
      securityGroupName: context.getAlbSgName(),
      // 概要
      description: 'SecurityGroup for ALB.'
    });
    // 気を利かせて Ingress は 0.0.0.0/0 で作成してくれるが
    // 先に許可 IP を登録したい場合は下記を設定
    // Ingress 設定
    albSecurityGroup.addIngressRule(
      // 許可 IP 設定
      aws_ec2.Peer.ipv4(context.getSgMyip()),
      // 許可ポート設定
      aws_ec2.Port.tcp(80),
      // 概要
      'My source IP.'
    );
    albSecurityGroup.addIngressRule(
      aws_ec2.Peer.ipv4(context.getSgMyip()),
      aws_ec2.Port.tcp(443),
      'My source IP.'
    );
    return albSecurityGroup;
  }

  /**
   * ECS 用 SecurityGroup 作成
   *
   * @param context: ContextGetter
   * @param vpc: aws_ec2.Vpc
   *
   * @returnse interface: SecurityGroupProps
   */
  public createEcsSg(context: ContextGetter, vpc: aws_ec2.Vpc) {
    return new aws_ec2.SecurityGroup(this, 'ecssecuritygroup', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: context.getEcsSgName(),
    });
  }

  /**
   * EC2 用 SecurityGroup 作成
   *
   * @param context: ContextGetter
   * @param vpc: aws_ec2.Vpc
   * @param ecsSg: aws_ec2.SecurityGroup
   *
   * @returnse interface: SecurityGroupProps
   */
  public createEc2Sg(context: ContextGetter, vpc: aws_ec2.Vpc, ecsSg: aws_ec2.SecurityGroup) {
    const ec2SecurityGroup = new aws_ec2.SecurityGroup(this, 'ec2securitygroup', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: context.getEc2SgName(),
    });
    ec2SecurityGroup.addIngressRule(
      aws_ec2.Peer.ipv4(context.getSgMyip()),
      aws_ec2.Port.tcp(22),
      'My source IP.'
    );
    ec2SecurityGroup.addIngressRule(
      aws_ec2.Peer.securityGroupId(ecsSg.securityGroupId),
      aws_ec2.Port.tcp(2049),
      'Traffic from EFS.'
    );
    return ec2SecurityGroup;
  }

  /**
   * RDS 用 SecurityGroup 作成
   *
   * @param context: ContextGetter
   * @param vpc: aws_ec2.Vpc
   * @param ecsSg: aws_ec2.SecurityGroup
   * @param ec2Sg: aws_ec2.SecurityGroup
   *
   * @returnse SG IF オブジェクト
   */
  public createRdsSg(context: ContextGetter, vpc: aws_ec2.Vpc, ecsSg: aws_ec2.SecurityGroup, ec2Sg: aws_ec2.SecurityGroup ) {
    const rdsSecurityGroup = new aws_ec2.SecurityGroup(this, 'rdssecuritygroup', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: context.getRdsSgName(),
    });
    rdsSecurityGroup.addIngressRule(
      aws_ec2.Peer.securityGroupId(ecsSg.securityGroupId),
      aws_ec2.Port.tcp(3306),
      'Traffic from ECS.'
    );
    rdsSecurityGroup.addIngressRule(
      aws_ec2.Peer.securityGroupId(ec2Sg.securityGroupId),
      aws_ec2.Port.tcp(3306),
      'Traffic from EC2.'
    );
    return rdsSecurityGroup;
  }
}