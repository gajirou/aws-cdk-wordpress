# aws-cdk-wordpress
## 利用方法
.env の以下をデプロイする AWS のアカウント情報に修正
```
CDK_DEFAULT_ACCOUNT=111111111111
CDK_DEFAULT_REGION=ap-northeast-1
AWS_DEFAULT_PROFILE=xxxxxxx
```
cdk.json に設定した AWS リソースの設定情報を変更する。
```
docker compose up -d
docker compose exec aws-cdk ash
cd src
npm install
# 初回
cdk bootstarap
cdk deploy --all --require-approval never -c stage=prod
```
## 作成される AWS リソース
![AWS 構成図](https://storage.googleapis.com/zenn-user-upload/4fa1cb94f814-20220807.png)
