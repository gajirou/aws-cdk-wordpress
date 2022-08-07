import { Stack, StackProps, aws_ec2, aws_efs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class Ec2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * EC2, EFS 作成
   *
   * @param context: ContextGetter
   * @param vpc: ec2.Vpc
   * @param ec2sg: ec2.SecurityGroup
   *
   * @returnse interface: FileSystemProps
   */
  public createEC2(context: ContextGetter, vpc: aws_ec2.Vpc, ec2sg: aws_ec2.SecurityGroup) {
    // Wordpress 操作用 EC2 作成
    const workEc2 = new aws_ec2.Instance(this, 'instance', {
      // ec2 作成 vpc
      vpc,
      // インスンスタイプ
      instanceType: aws_ec2.InstanceType.of(
        aws_ec2.InstanceClass.T3A,
        aws_ec2.InstanceSize.MICRO
      ),
      // マシーンイメージ
      machineImage: new aws_ec2.AmazonLinuxImage({
        generation: aws_ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType   : aws_ec2.AmazonLinuxCpuType.X86_64,
      }),
      // インスタンス名
      instanceName : context.getResouceName(),
      // ssh キーペア名
      keyName      : context.getEc2KeyName(),
      // セキュリティグループ
      securityGroup: ec2sg,
      // EC2 作成サブネット
      vpcSubnets: {
        subnetType: aws_ec2.SubnetType.PUBLIC
      }
    });

    // EC2, EFS マウント用 EFS 作成
    const elasticFileSystem = new aws_efs.FileSystem(this, 'efs', {
      // EFS 作成 VPC
      vpc,
      // EFS 名
      fileSystemName: context.getResouceName(),
      // EFS 設定セキュリティグループ
      securityGroup: ec2sg
    });

    // EFS マウント設定を EC2 userdata に追加
    elasticFileSystem.connections.allowDefaultPortFrom(workEc2)
    workEc2.userData.addCommands(
      'sudo yum check-update -y',
      'sudo yum upgrade -y',
      'sudo yum install -y amazon-efs-utils',
      'sudo mkdir /efs',
      'sudo mount -t efs ' + elasticFileSystem.fileSystemId + ':/ /efs',
      'sudo mkdir /efs/' + context.getResouceName()
    );
    return elasticFileSystem.fileSystemId;
  }
}