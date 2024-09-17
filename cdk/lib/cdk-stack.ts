import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as path from "path";

export class CdkStack extends cdk.Stack {
  private setupSSMParameters() {
    const environmentType = new ssm.StringParameter(this, "EnvironmentType", {
      parameterName: "/terraprobe/ENVIRONMENT",
      description: "Environment type",
      stringValue: new cdk.CfnParameter(this, "EnvironmentTypeValue", {
        type: "String",
        description: "Enter the environment type",
        noEcho: true,
      }).valueAsString,
    });

    const djangoSecretKey = new ssm.StringParameter(this, "DjangoSecretKey", {
      parameterName: "/terraprobe/DJANGO_SECRET_KEY",
      description: "Django Secret Key for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "DjangoSecretKeyValue", {
        type: "String",
        description: "Enter the Django Secret Key",
        noEcho: true,
      }).valueAsString,
    });

    const hortplusJackKey = new ssm.StringParameter(this, "HortplusJackKey", {
      parameterName: "/terraprobe/HORTPLUS_JACK_KEY",
      description: "Hortplus Jack Key for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "HortplusJackKeyValue", {
        type: "String",
        description: "Enter the Hortplus Jack Key",
        noEcho: true,
      }).valueAsString,
    });

    const soilDbPassword = new ssm.StringParameter(this, "SoilDbPassword", {
      parameterName: "/terraprobe/SOIL_DB_PASSWORD",
      description: "Database password for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "SoilDbPasswordValue", {
        type: "String",
        description: "Enter the Soil DB Password",
        noEcho: true,
      }).valueAsString,
    });

    const soilDbUser = new ssm.StringParameter(this, "SoilDbUser", {
      parameterName: "/terraprobe/SOIL_DB_USER",
      description: "Database user for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "SoilDbUserValue", {
        type: "String",
        description: "Enter the Soil DB User",
      }).valueAsString,
    });

    const soilDbName = new ssm.StringParameter(this, "SoilDbName", {
      parameterName: "/terraprobe/SOIL_DB_NAME",
      description: "Database name for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "SoilDbNameValue", {
        type: "String",
        description: "Enter the Soil DB Name",
      }).valueAsString,
    });

    const hortplusApiKey = new ssm.StringParameter(this, "HortplusApiKey", {
      parameterName: "/terraprobe/HORTPLUS_API_KEY",
      description: "Hortplus API Key for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "HortplusApiKeyValue", {
        type: "String",
        description: "Enter the Hortplus API Key",
        noEcho: true,
      }).valueAsString,
    });

    const hortplusMetwatchApiKey = new ssm.StringParameter(
      this,
      "HortplusMetwatchApiKey",
      {
        parameterName: "/terraprobe/HORTPLUS_METWATCH_API_KEY",
        description: "Hortplus Metwatch API Key for Terraprobe application",
        stringValue: new cdk.CfnParameter(this, "HortplusMetwatchApiKeyValue", {
          type: "String",
          description: "Enter the Hortplus Metwatch API Key",
          noEcho: true,
        }).valueAsString,
      }
    );

    const propertiesApiUrl = new ssm.StringParameter(this, "PropertiesApiUrl", {
      parameterName: "/terraprobe/PROPERTIES_API_URL",
      description: "Properties API URL for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "PropertiesApiUrlValue", {
        type: "String",
        description: "Enter the Properties API URL",
      }).valueAsString,
    });

    const metwatchApiUrl = new ssm.StringParameter(this, "MetwatchApiUrl", {
      parameterName: "/terraprobe/METWATCH_API_URL",
      description: "Metwatch API URL for Terraprobe application",
      stringValue: new cdk.CfnParameter(this, "MetwatchApiUrlValue", {
        type: "String",
        description: "Enter the Metwatch API URL",
      }).valueAsString,
    });

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

  private preCheck() {
    const keyPairName = "terraprobe";

    // Check if the EC2 key pair exists
    new cdk.CfnResource(this, "EC2KeyPairExistenceCheck", {
      type: "Custom::EC2KeyPairCheck",
      properties: {
        ServiceToken: new cdk.CustomResource(this, "EC2KeyPairCheckLambda", {
          serviceToken: new cdk.CfnParameter(this, "EC2KeyPairCheckLambdaArn", {
            type: "String",
            description:
              "ARN of the Lambda function to check EC2 key pair existence",
          }).valueAsString,
        })
          .getAtt("Arn")
          .toString(),
        KeyPairName: keyPairName,
        Region: this.region,
      },
    });

    // Add a condition to check if the EC2 key pair exists
    const keyPairExistsCondition = new cdk.CfnCondition(
      this,
      "EC2KeyPairExistsCondition",
      {
        expression: cdk.Fn.conditionEquals(
          cdk.Fn.getAtt("EC2KeyPairExistenceCheck", "KeyPairExists"),
          "true"
        ),
      }
    );

    // Add a rule to fail the deployment if the EC2 key pair doesn't exist
    new cdk.CfnRule(this, "EnsureEC2KeyPairExists", {
      assertions: [
        {
          assert: cdk.Fn.conditionEquals(keyPairExistsCondition, true),
          assertDescription: `The EC2 key pair '${keyPairName}' must exist in the AWS account and region (${this.region}).`,
        },
      ],
    });
  }

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.preCheck();

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
    } = this.setupSSMParameters();

    // Create ECR repository
    const ecrRepo = new ecr.Repository(this, "TerraprobeECRRepo", {
      repositoryName: "terraprobe",
    });

    // Build and push Docker image to ECR
    const image = new ecrAssets.DockerImageAsset(
      this,
      "TerraprobeDockerImage",
      {
        directory: path.join(__dirname, "../../soil"),
        file: "Dockerfile",
      }
    );

    // Create VPC
    const vpc = new ec2.Vpc(this, "TerraprobeVPC", {
      maxAzs: 2,
    });

    // Create RDS instance
    const dbInstance = new rds.DatabaseInstance(this, "SoilDatabase", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Do we need a NAT gateway here?
      },
      databaseName: "soil",
    });
    // Create EC2 instance
    const ec2Instance = new ec2.Instance(this, "SoilEC2Instance", {
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
      keyName: "terraprobe", // Use the 'terraprobe' keypair
    });

    // Define the systemd service file content
    const terraprobeServiceContent = `
[Unit]
Description=Terraprobe Docker Container
Requires=docker.service
After=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker run --rm -p 80:80 -p 443:443 \\
  -v /etc/letsencrypt:/etc/nginx/ssl:ro \\
  -e DJANGO_SETTINGS_MODULE=${djangoSecretKey.stringValue} \\
  -e DJANGO_SECRET_KEY=${djangoSecretKey.stringValue} \\
  -e HORTPLUS_JACK_KEY=${hortplusJackKey.stringValue} \\
  -e SOIL_DB_PASSWORD=${soilDbPassword.stringValue} \\
  -e SOIL_DB_USER=${soilDbUser.stringValue} \\
  -e SOIL_DB_NAME=${soilDbName.stringValue} \\
  -e SOIL_DB_HOST=${dbInstance.dbInstanceEndpointAddress} \\
  -e HORTPLUS_API_KEY=${hortplusApiKey.stringValue} \\
  -e HORTPLUS_METWATCH_API_KEY=${hortplusMetwatchApiKey.stringValue} \\
  -e PROPERTIES_API_URL=${propertiesApiUrl.stringValue} \\
  -e METWATCH_API_URL=${metwatchApiUrl.stringValue} \\
  -e ENVIRONMENT=${environmentType.stringValue} \\
  ${image.imageUri}
ExecStop=/usr/bin/docker stop terraprobe

[Install]
WantedBy=multi-user.target
`;

    // Add user data to set up Docker and create a systemd service
    ec2Instance.addUserData(
      "apt-get update",
      "apt-get install -y docker.io certbot",
      "systemctl start docker",
      "systemctl enable docker",
      // Create directory for SSL certificates
      "mkdir -p /etc/letsencrypt",
      // Generate self-signed certificate for initial setup
      "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/letsencrypt/nginx.key -out /etc/letsencrypt/nginx.crt -subj '/CN=localhost'",
      `aws ecr get-login-password --region ${this.region} | docker login --username AWS --password-stdin ${this.account}.dkr.ecr.${this.region}.amazonaws.com`,
      `docker pull ${image.imageUri}`,
      // Create a systemd service file
      `echo '${terraprobeServiceContent}' > /etc/systemd/system/terraprobe.service`,
      // Reload systemd, enable and start the service
      "systemctl daemon-reload",
      "systemctl enable terraprobe.service",
      "systemctl start terraprobe.service",
      // Add cron job to renew SSL certificate
      "(crontab -l 2>/dev/null; echo '0 12 1 * * /usr/bin/certbot renew --quiet') | crontab -"
    );

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
