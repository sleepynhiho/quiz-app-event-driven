## Vẽ và giải thích góc nhìn triển khai của Event-Driven Architecture được đề xuất trong bài lab 04? Liệt kê các công cụ có thể sử dụng và các bước cần thực hiện để triển khai hệ thống theo góc nhìn đề xuất.

### 1. Góc nhìn Triển khai (Deployment View) của Event-Driven Architecture

#### 1.1 Tổng quan Deployment Architecture

Góc nhìn triển khai mô tả cách các thành phần phần mềm được phân phối và triển khai trên hạ tầng vật lý/ảo hoá, bao gồm servers, containers, networks và dependencies.

**Production Deployment Architecture:**

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[React App<br/>Load Balanced]
    end
    
    subgraph "API Gateway"
        LB[Nginx Load Balancer<br/>:80, :443]
    end
    
    subgraph "Microservices"
        US[User Service<br/>:3001]
        QS[Quiz Service<br/>:3000]
        AS[Answer Service<br/>:3002]
        SS[Scoring Service<br/>:3003]
    end
    
    subgraph "Event Streaming"
        KAFKA[Kafka Cluster<br/>:9092]
        ZK[Zookeeper<br/>:2181]
    end
    
    subgraph "Data Storage"
        PG[(PostgreSQL<br/>:5432)]
        REDIS[(Redis<br/>:6379)]
    end
    
    subgraph "Monitoring"
        MON[Kafdrop & pgAdmin]
    end
    
    %% Main flow
    WEB --> LB
    LB --> US
    LB --> QS
    LB --> AS
    LB --> SS
    
    %% Event connections
    US -.->|events| KAFKA
    QS -.->|events| KAFKA
    AS -.->|events| KAFKA
    SS -.->|events| KAFKA
    
    %% Data connections
    US --> PG
    QS --> PG
    QS --> REDIS
    AS --> PG
    SS --> PG
    
    %% Infrastructure
    KAFKA --> ZK
    MON --> KAFKA
    MON --> PG
    
    classDef frontend fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef service fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef event fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef infra fill:#f5f5f5,stroke:#424242,stroke-width:2px
    
    class WEB frontend
    class LB infra
    class US,QS,AS,SS service
    class PG,REDIS data
    class KAFKA,ZK event
    class MON infra
```

#### 1.2 Container Deployment với Docker Swarm

**Docker Swarm Stack Architecture:**

```mermaid
graph TB
    subgraph "Docker Swarm Cluster"
        subgraph "Manager Nodes"
            M1[Manager Node 1<br/>quiz-app-manager-1]
            M2[Manager Node 2<br/>quiz-app-manager-2]
            M3[Manager Node 3<br/>quiz-app-manager-3]
        end
        
        subgraph "Worker Nodes"
            W1[Worker Node 1<br/>quiz-app-worker-1]
            W2[Worker Node 2<br/>quiz-app-worker-2]
            W3[Worker Node 3<br/>quiz-app-worker-3]
            W4[Worker Node 4<br/>quiz-app-worker-4]
        end
    end
    
    subgraph "Service Distribution"
        subgraph "Frontend Services"
            FS[frontend-service<br/>replicas: 2<br/>ports: 3000:3000]
        end
        
        subgraph "Backend Services"
            USS[user-service<br/>replicas: 2<br/>ports: 3001:3001]
            QSS[quiz-service<br/>replicas: 3<br/>ports: 3000:3000]
            ASS[answer-service<br/>replicas: 2<br/>ports: 3002:3002]
            SSS[scoring-service<br/>replicas: 2<br/>ports: 3003:3003]
        end
        
        subgraph "Infrastructure Services"
            PGSVC[postgres-service<br/>replicas: 1<br/>ports: 5432:5432]
            RDSVC[redis-service<br/>replicas: 1<br/>ports: 6379:6379]
            KFSVC[kafka-service<br/>replicas: 3<br/>ports: 9092:9092]
            ZKSVC[zookeeper-service<br/>replicas: 3<br/>ports: 2181:2181]
        end
        
        subgraph "Proxy Services"
            NGSVC[nginx-service<br/>replicas: 2<br/>ports: 80:80,443:443]
        end
    end
    
    %% Node assignments
    M1 --> NGSVC
    M2 --> PGSVC
    M3 --> KFSVC
    
    W1 --> FS
    W1 --> USS
    W2 --> QSS
    W2 --> ASS
    W3 --> SSS
    W3 --> RDSVC
    W4 --> ZKSVC
    
    classDef manager fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef worker fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef service fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class M1,M2,M3 manager
    class W1,W2,W3,W4 worker
    class FS,USS,QSS,ASS,SSS,PGSVC,RDSVC,KFSVC,ZKSVC,NGSVC service
```

#### 1.3 Kubernetes Deployment Architecture

**Kubernetes Cluster Layout:**

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Control Plane"
            API[API Server]
            ETCD[etcd]
            SCHED[Scheduler]
            CTRL[Controller Manager]
        end
        
        subgraph "quiz-app Namespace"
            subgraph "Frontend Deployment"
                FPOD1[frontend-pod-1]
                FPOD2[frontend-pod-2]
                FSVC[frontend-service<br/>LoadBalancer]
            end
            
            subgraph "Backend Deployments"
                UPOD1[user-pod-1]
                UPOD2[user-pod-2]
                USVC[user-service<br/>ClusterIP]
                
                QPOD1[quiz-pod-1]
                QPOD2[quiz-pod-2]
                QPOD3[quiz-pod-3]
                QSVC[quiz-service<br/>ClusterIP]
                
                APOD1[answer-pod-1]
                APOD2[answer-pod-2]
                ASVC[answer-service<br/>ClusterIP]
                
                SPOD1[scoring-pod-1]
                SPOD2[scoring-pod-2]
                SSVC[scoring-service<br/>ClusterIP]
            end
            
            subgraph "Data StatefulSets"
                PGSTS[postgres-statefulset<br/>replicas: 2]
                RDSTS[redis-statefulset<br/>replicas: 2]
                KFSTS[kafka-statefulset<br/>replicas: 3]
                ZKSTS[zookeeper-statefulset<br/>replicas: 3]
            end
            
            subgraph "Storage"
                PV1[postgres-pv-1]
                PV2[postgres-pv-2]
                RV1[redis-pv-1]
                KV1[kafka-pv-1]
                KV2[kafka-pv-2]
                KV3[kafka-pv-3]
            end
            
            subgraph "Configuration"
                CM[ConfigMaps]
                SEC[Secrets]
            end
        end
        
        subgraph "Ingress"
            ING[nginx-ingress<br/>*.quiz-app.com]
        end
    end
    
    %% Service connections
    FSVC --> FPOD1
    FSVC --> FPOD2
    USVC --> UPOD1
    USVC --> UPOD2
    QSVC --> QPOD1
    QSVC --> QPOD2
    QSVC --> QPOD3
    ASVC --> APOD1
    ASVC --> APOD2
    SSVC --> SPOD1
    SSVC --> SPOD2
    
    %% Storage bindings
    PGSTS --> PV1
    PGSTS --> PV2
    RDSTS --> RV1
    KFSTS --> KV1
    KFSTS --> KV2
    KFSTS --> KV3
    
    %% Configuration
    UPOD1 --> CM
    UPOD1 --> SEC
    QPOD1 --> CM
    QPOD1 --> SEC
    
    %% Ingress routing
    ING --> FSVC
    ING --> USVC
    ING --> QSVC
    ING --> ASVC
    ING --> SSVC
    
    classDef control fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef pod fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef storage fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef config fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class API,ETCD,SCHED,CTRL control
    class FPOD1,FPOD2,UPOD1,UPOD2,QPOD1,QPOD2,QPOD3,APOD1,APOD2,SPOD1,SPOD2 pod
    class PGSTS,RDSTS,KFSTS,ZKSTS,PV1,PV2,RV1,KV1,KV2,KV3 storage
    class CM,SEC,ING config
```

### 2. Công cụ Triển khai

#### 2.1 Container Orchestration Tools

**A. Docker & Docker Compose**
```yaml
# Development environment
Tools:
  - Docker Engine: 24.0+
  - Docker Compose: 2.0+
  - Docker BuildKit: Enhanced build performance

Usage:
  - Local development
  - Integration testing
  - CI/CD pipeline builds
```

**B. Docker Swarm**
```yaml
# Production ready clustering
Tools:
  - Docker Swarm Mode: Built-in orchestration
  - Docker Stack: Multi-service deployment
  - Docker Secrets: Configuration management

Benefits:
  - Simple setup compared to Kubernetes
  - Native Docker integration
  - Built-in load balancing
  - Rolling updates support
```

**C. Kubernetes**
```yaml
# Enterprise grade orchestration  
Tools:
  - Kubernetes: 1.28+
  - Helm: Package management
  - kubectl: CLI management
  - Kustomize: Configuration management

Distributions:
  - Google GKE: Managed Kubernetes
  - Amazon EKS: AWS managed
  - Azure AKS: Azure managed
  - Minikube: Local development
```

#### 2.2 Infrastructure as Code Tools

**A. Terraform**
```hcl
# Infrastructure provisioning
resource "aws_ecs_cluster" "quiz_app" {
  name = "quiz-app-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "quiz_service" {
  name            = "quiz-service"
  cluster         = aws_ecs_cluster.quiz_app.id
  task_definition = aws_ecs_task_definition.quiz_service.arn
  desired_count   = 3
  
  load_balancer {
    target_group_arn = aws_lb_target_group.quiz_tg.arn
    container_name   = "quiz-service"
    container_port   = 3000
  }
}
```

**B. Ansible**
```yaml
# Configuration management
- name: Deploy Quiz App Services
  hosts: all
  tasks:
    - name: Start Docker containers
      docker_container:
        name: "{{ item.name }}"
        image: "{{ item.image }}"
        ports: "{{ item.ports }}"
        env: "{{ item.environment }}"
      loop:
        - name: quiz-service
          image: quiz-app/quiz-service:latest
          ports: ["3000:3000"]
          environment:
            NODE_ENV: production
            DATABASE_URL: "{{ db_url }}"
```

#### 2.3 CI/CD Pipeline Tools

**A. GitLab CI/CD**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build_services:
  stage: build
  script:
    - docker build -t quiz-app/quiz-service:$CI_COMMIT_SHA services/quiz-service/
    - docker push quiz-app/quiz-service:$CI_COMMIT_SHA

deploy_staging:
  stage: deploy
  script:
    - helm upgrade --install quiz-app ./helm-chart
      --set image.tag=$CI_COMMIT_SHA
      --namespace staging
  environment:
    name: staging
    url: https://staging.quiz-app.com
```

**B. GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy Quiz App
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push images
        run: |
          docker build -t ${{ secrets.REGISTRY }}/quiz-service:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/quiz-service:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/quiz-service 
            quiz-service=${{ secrets.REGISTRY }}/quiz-service:${{ github.sha }}
```

### 3. Các bước Triển khai Hệ thống

#### 3.1 Development Environment Setup

**Step 1: Local Development với Docker Compose**
```bash
# 1. Clone repository và setup environment
git clone https://github.com/your-org/quiz-app-event-driven.git
cd quiz-app-event-driven

# 2. Setup environment variables
cp .env.example .env
# Edit .env với local configuration

# 3. Build và start infrastructure services
docker-compose -f docker-compose.dev.yml up -d postgres redis kafka zookeeper

# 4. Wait for services to be ready
./scripts/wait-for-services.sh

# 5. Run database migrations
npm run db:migrate

# 6. Build application images
docker-compose -f docker-compose.dev.yml build

# 7. Start all services
docker-compose -f docker-compose.dev.yml up -d

# 8. Verify deployment
curl http://localhost:3000/health
curl http://localhost:3001/health  
curl http://localhost:3002/health
curl http://localhost:3003/health
```

**Step 2: Development Docker Compose Configuration**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Infrastructure Services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quiz_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.0.1
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  # Application Services
  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quiz_dev
    depends_on: [postgres]

  quiz-service:
    build: ./services/quiz-service
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quiz_dev
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:9092
    depends_on: [postgres, redis, kafka]

  answer-service:
    build: ./services/answer-service
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quiz_dev
      KAFKA_BROKERS: kafka:9092
    depends_on: [postgres, kafka]

  scoring-service:
    build: ./services/scoring-service
    ports:
      - "3003:3003"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quiz_dev
      KAFKA_BROKERS: kafka:9092
    depends_on: [postgres, kafka]

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on: [user-service, quiz-service, answer-service, scoring-service]

volumes:
  postgres_data:
  redis_data:
```

#### 3.2 Staging Environment Deployment

**Step 1: Docker Swarm Staging Setup**
```bash
# 1. Initialize Docker Swarm
docker swarm init --advertise-addr <MANAGER_IP>

# 2. Join worker nodes
docker swarm join --token <WORKER_TOKEN> <MANAGER_IP>:2377

# 3. Create overlay networks
docker network create --driver overlay quiz-app-network
docker network create --driver overlay kafka-network

# 4. Deploy stack services
docker stack deploy -c docker-stack.staging.yml quiz-app

# 5. Verify deployment
docker service ls
docker service ps quiz-app_quiz-service
```

**Step 2: Staging Stack Configuration**
```yaml
# docker-stack.staging.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    configs:
      - source: nginx_config
        target: /etc/nginx/nginx.conf
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
    networks:
      - quiz-app-network

  quiz-service:
    image: quiz-app/quiz-service:staging
    environment:
      NODE_ENV: staging
      DATABASE_URL_FILE: /run/secrets/db_url
      KAFKA_BROKERS: kafka:9092
    secrets:
      - db_url
      - jwt_secret
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 30s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    networks:
      - quiz-app-network
      - kafka-network

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quiz_staging
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_user
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    networks:
      - quiz-app-network

  kafka:
    image: confluentinc/cp-kafka:7.0.1
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
    deploy:
      replicas: 3
      placement:
        max_replicas_per_node: 1
    networks:
      - kafka-network

networks:
  quiz-app-network:
    driver: overlay
    attachable: true
  kafka-network:
    driver: overlay

volumes:
  postgres_data:

secrets:
  db_url:
    external: true
  db_user:
    external: true
  db_password:
    external: true
  jwt_secret:
    external: true

configs:
  nginx_config:
    external: true
```

#### 3.3 Production Kubernetes Deployment

**Step 1: Kubernetes Production Setup**
```bash
# 1. Setup Kubernetes cluster (example with kubeadm)
kubeadm init --pod-network-cidr=10.244.0.0/16

# 2. Install CNI plugin (Flannel)
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# 3. Join worker nodes
kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash <HASH>

# 4. Create namespace
kubectl create namespace quiz-app

# 5. Setup RBAC và service accounts
kubectl apply -f k8s/rbac/

# 6. Deploy infrastructure components
kubectl apply -f k8s/infrastructure/

# 7. Deploy application services
kubectl apply -f k8s/applications/

# 8. Setup ingress
kubectl apply -f k8s/ingress/
```

**Step 2: Kubernetes Application Manifests**
```yaml
# k8s/applications/quiz-service.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quiz-service
  namespace: quiz-app
  labels:
    app: quiz-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: quiz-service
  template:
    metadata:
      labels:
        app: quiz-service
    spec:
      containers:
      - name: quiz-service
        image: quiz-app/quiz-service:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: quiz-secrets
              key: database-url
        - name: KAFKA_BROKERS
          value: "kafka:9092"
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
      volumes:
      - name: config-volume
        configMap:
          name: quiz-config
---
apiVersion: v1
kind: Service
metadata:
  name: quiz-service
  namespace: quiz-app
spec:
  selector:
    app: quiz-service
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP
```

**Step 3: Helm Chart Deployment**
```bash
# 1. Create Helm chart structure
helm create quiz-app

# 2. Customize values for production
cat > values.prod.yml << EOF
replicaCount: 3

image:
  repository: quiz-app/quiz-service
  tag: v1.0.0
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: quiz-app.production.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: quiz-app-tls
      hosts:
        - quiz-app.production.com
EOF

# 3. Deploy with Helm
helm upgrade --install quiz-app ./quiz-app-chart \
  --values values.prod.yml \
  --namespace quiz-app \
  --create-namespace

# 4. Verify deployment
helm status quiz-app -n quiz-app
kubectl get pods -n quiz-app
```

#### 3.4 Monitoring & Observability Setup

**Step 1: Prometheus & Grafana Setup**
```yaml
# monitoring/prometheus-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'quiz-services'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: quiz-service|answer-service|scoring-service|user-service
    - job_name: 'kafka'
      static_configs:
      - targets: ['kafka:9092']
    - job_name: 'postgres'
      static_configs:
      - targets: ['postgres:5432']
```

**Step 2: Logging với ELK Stack**
```yaml
# logging/filebeat-config.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*quiz*.log
      processors:
        - add_kubernetes_metadata:
            in_cluster: true
    
    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
      index: "quiz-app-logs-%{+yyyy.MM.dd}"
    
    setup.template.name: "quiz-app"
    setup.template.pattern: "quiz-app-*"
```

**Step 3: Health Checks & Alerts**
```yaml
# monitoring/alertmanager-rules.yml
groups:
- name: quiz-app-alerts
  rules:
  - alert: ServiceDown
    expr: up{job=~"quiz-.*"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Quiz service {{ $labels.instance }} is down"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected in {{ $labels.service }}"
      
  - alert: KafkaLag
    expr: kafka_consumer_lag_sum > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Kafka consumer lag is high: {{ $value }}"
```

Kiến trúc triển khai Event-driven này giúp đảm bảo **high availability**, **scalability**, và **maintainability** cho Quiz App system, với khả năng tự động scale theo load và recover từ failures.