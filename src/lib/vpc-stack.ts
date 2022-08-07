import { Stack, StackProps, aws_ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * VPC 作成
   *
   * @param context: ContextGetter
   *
   * @returnse interface VpcProps
   */
  public createVpc(context: ContextGetter) {
    return new aws_ec2.Vpc(this, 'vpc', {
      // VPC 設置 CIDR
      cidr: context.getVpcCidr(),
      // VPC flowlog 作成
      flowLogs: {
        'vpcflowlog': {}
      },
      // 利用 AZ 数
      maxAzs: context.getVpcMaxAz(),
      // VPC 名
      vpcName: context.getResouceName(),
      // Subnet 設定
      subnetConfiguration: [
        {
          // Subnet 名
          name      : context.getVpcPublicSubnetName(),
          // Subnet の CIDR マスク
          cidrMask  : context.getVpcSubnetCidrMask(),
          // Subnet のタイプ（パブリック or プライベート or プライベート　＋ Nat）
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          name      : context.getVpcPrivateSubnetName(),
          cidrMask  : context.getVpcSubnetCidrMask(),
          subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
  }
}