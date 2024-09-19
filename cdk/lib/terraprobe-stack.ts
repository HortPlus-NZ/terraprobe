import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as path from "path";

export class TerraprobeStack extends cdk.Stack {
  private setupContextParameters() {
    const environmentType = this.node.tryGetContext("ENVIRONMENT");
    if (!environmentType || !["staging", "prod"].includes(environmentType)) {
      throw new Error(
        "ENVIRONMENT must be set to either 'staging' or 'prod' in CDK context"
      );
    }

    const djangoSecretKey = this.node.tryGetContext("DJANGO_SECRET_KEY");
    if (!djangoSecretKey) {
      throw new Error("DJANGO_SECRET_KEY must be set in CDK context");
    }

    const hortplusJackKey = this.node.tryGetContext("HORTPLUS_JACK_KEY");
    if (!hortplusJackKey) {
      throw new Error("HORTPLUS_JACK_KEY must be set in CDK context");
    }

    const soilDbPassword = this.node.tryGetContext("SOIL_DB_PASSWORD");
    if (!soilDbPassword) {
      throw new Error("SOIL_DB_PASSWORD must be set in CDK context");
    }

    const soilDbUser = this.node.tryGetContext("SOIL_DB_USER");
    if (!soilDbUser) {
      throw new Error("SOIL_DB_USER must be set in CDK context");
    }

    const soilDbName = this.node.tryGetContext("SOIL_DB_NAME");
    if (!soilDbName) {
      throw new Error("SOIL_DB_NAME must be set in CDK context");
    }

    const hortplusApiKey = this.node.tryGetContext("HORTPLUS_API_KEY");
    if (!hortplusApiKey) {
      throw new Error("HORTPLUS_API_KEY must be set in CDK context");
    }

    const hortplusMetwatchApiKey = this.node.tryGetContext(
      "HORTPLUS_METWATCH_API_KEY"
    );
    if (!hortplusMetwatchApiKey) {
      throw new Error("HORTPLUS_METWATCH_API_KEY must be set in CDK context");
    }

    const propertiesApiUrl = this.node.tryGetContext("PROPERTIES_API_URL");
    if (!propertiesApiUrl) {
      throw new Error("PROPERTIES_API_URL must be set in CDK context");
    }

    const metwatchApiUrl = this.node.tryGetContext("METWATCH_API_URL");
    if (!metwatchApiUrl) {
      throw new Error("METWATCH_API_URL must be set in CDK context");
    }

    return {
      environmentType,
      djangoSecretKey,
      hortplusJackKey,
      soilDbPassword,
      soilDbUser,
      soilDbName,
      hortplusApiKey,
      hortplusMetwatchApiKey,
      propertiesApiUrl,
      metwatchApiUrl,
    };
  }

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      environmentType,
      djangoSecretKey,
      hortplusJackKey,
      soilDbPassword,
      soilDbUser,
      soilDbName,
      hortplusApiKey,
      hortplusMetwatchApiKey,
      propertiesApiUrl,
      metwatchApiUrl,
    } = this.setupContextParameters();

    // Build Docker image
    const image = new ecrAssets.DockerImageAsset(
      this,
      "TerraprobeDockerImage",
      {
        directory: path.join(__dirname, "../.."),
        exclude: [".git", "cdk", "node_modules", "cdk.out"],
        file: "soil/Dockerfile",
        buildArgs: {
          ENVIRONMENT: "staging",
        },
      }
    );

    // Create VPC
    const vpc = new ec2.Vpc(this, "TerraprobeVPC", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create RDS instance
    const dbInstance = new rds.DatabaseInstance(this, "TerraprobeDatabase", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Do we need a NAT gateway here?
      },
      databaseName: soilDbName,
      credentials: rds.Credentials.fromPassword(
        soilDbUser,
        cdk.SecretValue.unsafePlainText(soilDbPassword)
      ),
    });

    // Create the private key
    const key = new ec2.KeyPair(this, "TerraprobeKeyPair", {
      keyPairName: "terraprobe",
    });

    // Save the private key to AWS Systems Manager Parameter Store
    new ssm.StringParameter(this, "TerraprobePrivateKey", {
      parameterName: "/ec2/terraprobe-private-key",
      description: "Private key for Terraprobe EC2 instance",
      stringValue: key.privateKey.toString(),
    });

    // Create EC2 instance
    const ec2Instance = new ec2.Instance(this, "TerraprobeEC2Instance", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.genericLinux({
        "ap-southeast-2": ec2.MachineImage.genericLinux({
          "ap-southeast-2": "ami-0310483fb2b488153", // Ubuntu 22.04 LTS in ap-southeast-2
        }).getImage(this).imageId,
      }),
      userData: ec2.UserData.forLinux(),
      keyPair: key,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      blockDevices: [
        {
          deviceName: "/dev/sda1",
          volume: ec2.BlockDeviceVolume.ebs(50),
        },
      ],
    });

    // Grant EC2 instance permission to pull from ECR
    image.repository.grantPull(ec2Instance);

    // Define the systemd service file content
    const terraprobeServiceContent = `
[Unit]
Description=Terraprobe Docker Container
Requires=docker.service
After=docker.service

[Service]
Restart=always
EnvironmentFile=/etc/terraprobe/environment
ExecStartPre=/usr/bin/docker pull \${ECR_IMAGE_URI}
ExecStart=/usr/bin/docker run --rm --name terraprobe -p 80:80 -p 443:443 \\
  -v /etc/letsencrypt:/etc/nginx/ssl:ro \\
  -e DJANGO_SETTINGS_MODULE=\${DJANGO_SETTINGS_MODULE} \\
  -e DJANGO_SECRET_KEY=\${DJANGO_SECRET_KEY} \\
  -e HORTPLUS_JACK_KEY=\${HORTPLUS_JACK_KEY} \\
  -e SOIL_DB_PASSWORD=\${SOIL_DB_PASSWORD} \\
  -e SOIL_DB_USER=\${SOIL_DB_USER} \\
  -e SOIL_DB_NAME=\${SOIL_DB_NAME} \\
  -e SOIL_DB_HOST=\${SOIL_DB_HOST} \\
  -e HORTPLUS_API_KEY=\${HORTPLUS_API_KEY} \\
  -e HORTPLUS_METWATCH_API_KEY=\${HORTPLUS_METWATCH_API_KEY} \\
  -e PROPERTIES_API_URL=\${PROPERTIES_API_URL} \\
  -e METWATCH_API_URL=\${METWATCH_API_URL} \\
  -e ENVIRONMENT=\${ENVIRONMENT} \\
  \${ECR_IMAGE_URI}
ExecStop=/usr/bin/docker stop terraprobe

[Install]
WantedBy=multi-user.target
`;

    // Add user data to set up Docker and create a systemd service
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      "export DEBIAN_FRONTEND=noninteractive",
      "apt-get update",
      'apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" docker.io certbot awscli',
      "systemctl start docker",
      "systemctl enable docker",
      "mkdir -p /etc/letsencrypt",
      "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/letsencrypt/nginx.key -out /etc/letsencrypt/nginx.crt -subj '/CN=localhost'",
      `aws ecr get-login-password --region ${this.region} | docker login --username AWS --password-stdin ${this.account}.dkr.ecr.${this.region}.amazonaws.com`,
      "mkdir -p /etc/terraprobe",
      `cat << EOF > /etc/terraprobe/environment
ECR_IMAGE_URI=${image.imageUri}
DJANGO_SETTINGS_MODULE=soil.settings.${environmentType}_docker
DJANGO_SECRET_KEY=${djangoSecretKey}
HORTPLUS_JACK_KEY=${hortplusJackKey}
SOIL_DB_PASSWORD=${soilDbPassword}
SOIL_DB_USER=${soilDbUser}
SOIL_DB_NAME=${soilDbName}
SOIL_DB_HOST=${dbInstance.dbInstanceEndpointAddress}
HORTPLUS_API_KEY=${hortplusApiKey}
HORTPLUS_METWATCH_API_KEY=${hortplusMetwatchApiKey}
PROPERTIES_API_URL=${propertiesApiUrl}
METWATCH_API_URL=${metwatchApiUrl}
ENVIRONMENT=${environmentType}
EOF`,
      `echo '${terraprobeServiceContent}' > /etc/systemd/system/terraprobe.service`,
      `if [ "${environmentType}" = "prod" ]; then`,
      "  certbot certonly --standalone -d terraprobe.hortplus.com --non-interactive --agree-tos --email admin@hortplus.com --cert-name terraprobe --force-renewal --key-path /etc/letsencrypt/nginx.key --fullchain-path /etc/letsencrypt/nginx.crt",
      "  systemctl restart terraprobe.service",
      "fi",
      "systemctl daemon-reload",
      "systemctl enable terraprobe.service",
      "systemctl start terraprobe.service",
      `if [ "${environmentType}" = "prod" ]; then`,
      `  cat << EOF > /etc/cron.monthly/renew-cert
#!/bin/bash
systemctl stop terraprobe.service
/usr/bin/certbot renew --standalone --quiet --cert-name terraprobe --force-renewal --key-path /etc/letsencrypt/nginx.key --fullchain-path /etc/letsencrypt/nginx.crt
systemctl start terraprobe.service
EOF`,
      "  chmod +x /etc/cron.monthly/renew-cert",
      "fi"
    );

    // Update EC2 instance to use the new userData
    ec2Instance.addUserData(...userData.render().split("\n"));

    // Allow inbound traffic to EC2
    ec2Instance.connections.allowFromAnyIpv4(ec2.Port.tcp(80));
    ec2Instance.connections.allowFromAnyIpv4(ec2.Port.tcp(443));

    // Create Route53 record only if environment is 'prod'
    if (environmentType.stringValue === "prod") {
      const zone = route53.HostedZone.fromLookup(this, "Zone", {
        domainName: "hortplus.com",
      });
      new route53.ARecord(this, "SoilDNSRecord", {
        zone,
        recordName: "terraprobe.hortplus.com",
        target: route53.RecordTarget.fromIpAddresses(
          ec2Instance.instancePublicIp
        ),
      });
    }
  }
}
