import { Stack, StackProps, aws_ec2, aws_rds } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ContextGetter } from './context-getter';

export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  /**
   * RDS 作成
   *
   * @param context: ContextGetter
   * @param vpc: ec2.Vpc
   * @param rdsSg: ec2.SecurityGroup
   */
  public createRds(context: ContextGetter, vpc: aws_ec2.Vpc, rdsSg: aws_ec2.SecurityGroup) {
    // サブネットグループ作成
    const subnetGroup = new aws_rds.SubnetGroup(this, 'subnetgroup', {
      // VPC 設定
      vpc,
      // サブネット設定
      vpcSubnets: { subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT },
      // サブネットグループ名
      subnetGroupName: context.getResouceName() + '-private',
      // 概要
      description: 'SubnetGroup for Aurora db',
    })

    // クラスターパラメータグループ作成
    const clusterParameterGroup = new aws_rds.ParameterGroup(this, 'cluster', {
      // データベースエンジン設定
      engine: aws_rds.DatabaseClusterEngine.auroraMysql({
        version: aws_rds.AuroraMysqlEngineVersion.VER_3_01_0
      }),
      // パラメータ設定
      parameters: {
        time_zone: 'Asia/Tokyo',
        character_set_client: 'utf8mb4',
        character_set_connection: 'utf8mb4',
        character_set_database: 'utf8mb4',
        character_set_results: 'utf8mb4',
        character_set_server: 'utf8mb4',
        collation_connection: 'utf8mb4_bin',
      }
    })
    // インスタンスパラメータグループ作成
    const instanceParameterGroup = new aws_rds.ParameterGroup(this, 'instance', {
      // データベースエンジン設定
      engine: aws_rds.DatabaseClusterEngine.auroraMysql({
        version: aws_rds.AuroraMysqlEngineVersion.VER_3_01_0
      })
    })

    // RDS 作成
    new aws_rds.DatabaseCluster(this, 'rds', {
      // データベースエンジン設定
      engine: aws_rds.DatabaseClusterEngine.auroraMysql({
         version: aws_rds.AuroraMysqlEngineVersion.VER_3_01_0
      }),
      // インスタンス設定
      instanceProps: {
        // VPC 設定
        vpc,
        // マイナーバージョン自動アップグレード
        autoMinorVersionUpgrade: false,
        // インスタンスタイプ
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.BURSTABLE3,
          aws_ec2.InstanceSize.MEDIUM,
        ),
        // パラメータグループ
        parameterGroup: instanceParameterGroup,
        // セキュリティグループ
        securityGroups: [rdsSg],
      },
      // クラスター名
      clusterIdentifier: context.getResouceName(),
      // 管理ユーザ名
      credentials: aws_rds.Credentials.fromGeneratedSecret(context.getRdsCredencial()),
      // デフォルト DB 名
      defaultDatabaseName: context.getRdsDefaultDBName(),
      // 削除保護
      deletionProtection: false,
      // インスタンス数
      instances: 1,
      // パラメータグループクラスター
      parameterGroup: clusterParameterGroup,
      // サブネットグループ
      subnetGroup: subnetGroup
    });
  }
}