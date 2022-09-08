import { Construct } from 'constructs';

// コンテキスト操作クラス
export class ContextGetter {
  constructor(
    private scope: Construct, private stage: string){}

  /**
   * プロジェクト名を取得
   *
   * @returnse string: プロジェクト名
   */
  public getProjectName(): string {
    return this.scope.node.tryGetContext('project')
  }

  /**
   * リソース名を取得
   *
   * @returnse string: ステージとプロジェクト名を結合したリソース名
   */
  public getResouceName(): string {
    return this.stage + '-' + this.getProjectName()
  }

  /**
   * VPC cidr を取得
   *
   * @returnse string: CIDR
   */
  public getVpcCidr(): string {
    return this.scope.node.tryGetContext(this.stage)['vpc']['vpccidr']
  }

  /**
   * VPC 利用 AZ 数を取得
   *
   * @returnse number: AZ 数
   */
   public getVpcMaxAz(): number {
    return this.scope.node.tryGetContext(this.stage)['vpc']['maxazs']
  }

  /**
   * VPC サブネットマスク を取得
   *
   * @returnse number: サブネットマスク
   */
   public getVpcSubnetCidrMask(): number {
    return this.scope.node.tryGetContext(this.stage)['vpc']['subnetcidrmask']
  }

  /**
   * VPC パブリックサブネット名を取得
   *
   * @returnse string: パブリックサブネット名
   */
   public getVpcPublicSubnetName(): string {
    return 'public'
  }

  /**
   * VPC プライベートサブネット名を取得
   *
   * @returnse string: プライベートサブネット名
   */
  public getVpcPrivateSubnetName(): string {
    return 'private'
  }

  /**
   * EC2 key 名を取得
   *
   * @returnse string: ssh key 名
   */
   public getEc2KeyName(): string {
    return this.scope.node.tryGetContext(this.stage)['ec2']['keyname']
  }

  /**
   * SG ソース IP 取得
   *
   * @returnse string: ソース IP
   */
  public getSgMyip(): string {
    return this.scope.node.tryGetContext(this.stage)['sg']['myip']
  }

  /**
   * SG ALB SG名 取得
   *
   * @returnse string: ALB SG名
   */
   public getAlbSgName(): string {
    return this.getResouceName() + '-alb'
  }

  /**
   * SG ECS SG名 取得
   *
   * @returnse string: ECS SG名
   */
  public getEcsSgName(): string {
    return this.getResouceName() + '-ecs'
  }

  /**
   * SG EC2 SG名 取得
   *
   * @returnse string: EC2 SG名
   */
  public getEc2SgName(): string {
    return this.getResouceName() + '-ec2'
  }

  /**
   * SG RDS SG名 取得
   *
   * @returnse string: RDS SG名
   */
   public getRdsSgName(): string {
    return this.getResouceName() + '-rds'
  }

  /**
   * SG S3 バケット名取得
   *
   * @returnse string:  S3 バケット
   */
     public getS3BucketName(): string {
      // 一意の名称にする必要があるため任意の文字列を結合
      // getProjectName() で一意の名称になるなら不要
      return this.getProjectName() + '-gajirou'
  }

  /**
   * ECS Fargate Cpu サイズを取得
   *
   * @returnse number: Fargate Cpu サイズ
   */
  public getEcsFargateCpu(): number {
    return this.scope.node.tryGetContext(this.stage)['ecs']['cpu']
  }

  /**
   * ECS Fargate Memory サイズを取得
   *
   * @returnse number: Fargate Memory サイズ
   */
  public getEcsFargateMemory(): number {
    return this.scope.node.tryGetContext(this.stage)['ecs']['memory']
  }

  /**
   * ECS 起動 Task 数
   *
   * @returnse number: 起動 Task 数
   */
  public getEcsDesiredCount(): number {
    return this.scope.node.tryGetContext(this.stage)['ecs']['desiredcount']
  }

  /**
   * ECS Task イメージを取得
   *
   * @returnse string: image 名
   */
   public getEcsImage(): string {
    return this.scope.node.tryGetContext(this.stage)['ecs']['image']
  }

  /**
   * ECS Task コンテナ名を取得
   *
   * @returnse string: コンテナ 名
   */
  public getEcsContainerName(): string {
    return this.scope.node.tryGetContext(this.stage)['ecs']['conteinername']
  }

  /**
   * ALB 証明書 ARN
   *
   * @returnse string: 証明書 ARN
   */
   public getAlbCertificateArn(): string {
    return this.scope.node.tryGetContext(this.stage)['alb']['certificatearn']
  }

  /**
   * ALB アイドルタイムアウト
   *
   * @returnse number: アイドルタイムアウト
   */
     public getAlbIdleTimeout(): number {
      return this.scope.node.tryGetContext(this.stage)['alb']['idletimeout']
    }

  /**
   * RDS 管理ユーザ
   *
   * @returnse string: 管理ユーザ名
   */
   public getRdsCredencial(): string {
    return this.scope.node.tryGetContext(this.stage)['rds']['credentials']
  }

  /**
   * RDS デフォルト DB 名
   *
   * @returnse string: DB 名
   */
  public getRdsDefaultDBName(): string {
    return this.scope.node.tryGetContext(this.stage)['rds']['defaultdatabasename']
  }
}
