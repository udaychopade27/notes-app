pipeline {
    agent any

    parameters {
        choice(
            name: 'build',
            choices: ['Build_all', 'Build_backend', 'Build_frontend', 'Restart_frontend', 'Restart_backend', 'Restart_all'],
            description: 'Build parameter choices'
        )
    }

    environment {
        LOCAL_DIR = "/home/ubuntu/notes-app"
        COMPOSE_CMD = "cd ${LOCAL_DIR} && docker-compose -f docker-compose.yml --env-file notes-app-env-file -p notes-app"
    }

    stages {
        stage('Checkout') {
            steps {
                sh "git --version"
                sh "docker -v"
                sh "echo Branch name: ${env.BRANCH_NAME}"
            }
        }

        stage('Build_stage') {
            parallel {
                stage('Build_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker-compose -f docker-compose.yml build frontend"
                        sh "docker tag notes-app-frontend uday27/notes-app-frontend:v1.0"
                    }
                }
                stage('Build_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker-compose -f docker-compose.yml build backend"
                        sh "docker tag notes-app-backend uday27/notes-app-backend:v1.0"
                    }
                }
            }
        }

        stage('Push_to_DockerHub') {
            parallel {
                stage('push_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                                docker.image('uday27/notes-app-frontend:v1.0').push()
                            }
                        }
                    }
                }
                stage('push_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                                docker.image('uday27/notes-app-backend:v1.0').push()
                            }
                        }
                    }
                }
            }
        }

        stage('Transfering_files_to_EC2') {
            when {
                expression { return ['Build_all', 'Build_backend', 'Build_frontend'].contains(params.build) }
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                    string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                ]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$SSH_HOST "mkdir -p ${LOCAL_DIR}"
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY docker-compose.yml $SSH_USER@$SSH_HOST:${LOCAL_DIR}/docker-compose.yml
                    """
                    withCredentials([file(credentialsId: "notes-app-env-file", variable: 'ENV_FILE')]) {
                        sh """
                            scp -o StrictHostKeyChecking=no -i $SSH_KEY $ENV_FILE $SSH_USER@$SSH_HOST:${LOCAL_DIR}/notes-app-env-file
                        """
                    }
                }
            }
        }

        stage('Deploying') {
            parallel {
                stage('Deploy_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} pull frontend && ${COMPOSE_CMD} up -d frontend'
                                """
                            }
                        }
                    }
                }

                stage('Deploy_backend') {
                    when {
                        expression { params.build == 'Build_backend' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} pull backend && ${COMPOSE_CMD} up -d backend'
                                """
                            }
                        }
                    }
                }

                stage('Deploy_all') {
                    when {
                        expression { params.build == 'Build_all' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} pull && ${COMPOSE_CMD} up -d'
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Restart Containers') {
            parallel {
                stage('Restart_frontend') {
                    when {
                        expression { params.build == 'Restart_frontend' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} stop frontend && ${COMPOSE_CMD} up -d frontend'
                                """
                            }
                        }
                    }
                }

                stage('Restart_backend') {
                    when {
                        expression { params.build == 'Restart_backend' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} stop backend && ${COMPOSE_CMD} up -d backend'
                                """
                            }
                        }
                    }
                }

                stage('Restart_all') {
                    when {
                        expression { params.build == 'Restart_all' }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'ec2-ssh-user', variable: 'SSH_USER'),
                            string(credentialsId: 'ec2-ssh-host', variable: 'SSH_HOST')
                        ]) {
                            sshagent(['ec2-ssh-key']) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST '${COMPOSE_CMD} down && ${COMPOSE_CMD} up -d'
                                """
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
