pipeline {
    agent any

    parameters {
        choice(
            choices: ['Build_all', 'Build_backend', 'Build_frontend', 'Restart_frontend', 'Restart_backend', 'Restart_all'],
            description: 'Build parameter choices',
            name: 'build'
        )
    }

    environment {
        ENV_FILE = credentials("notes-app-env-file")
        REMOTE_HOST = credentials("ec2-ssh-host")
        REMOTE_USER = credentials("ec2-ssh-user")
        RWD = "/home/ubuntu/app/notes-app"
    }

    stages {
        stage('Checkout') {
            steps {
                sh "git --version"
                sh "docker -v"
                sh "echo Branch name: ${GIT_BRANCH}"
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
                    }
                }

                stage('Build_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker-compose -f docker-compose.yml build backend"
                    }
                }
            }
        }

        stage('push_images_to_dockerhub') {
            parallel {
                stage('saving_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                            sh """
                                echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
                                docker tag notes-app-frontend uday27/notes-app-frontend:v1.0
                                docker push uday27/notes-app-frontend:v1.0
                                docker logout
                            """
                        }
                    }
                }

                stage('saving_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                            sh """
                                echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
                                docker tag notes-app-backend uday27/notes-app-backend:v1.0
                                docker push uday27/notes-app-backend:v1.0
                                docker logout
                            """
                        }
                    }
                }
            }
        }

        stage('Transfering_tar_file') {
            steps {
                sshagent(["ec2-ssh-key"]) {
                    sh "mkdir -p ${RWD}"
                    sh "scp -r docker-compose.yml ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                    sh "scp -r ${ENV_FILE} ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                }
            }
        }

        stage('loading_images') {
            parallel {
                stage('loading_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker pull uday27/notes-app-frontend:v1.0'"
                        }
                    }
                }

                stage('loading_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker pull uday27/notes-app-backend:v1.0'"
                        }
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
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d frontend'"
                        }
                    }
                }

                stage('Deploy_backend') {
                    when {
                        expression { params.build == 'Build_backend' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d backend'"
                        }
                    }
                }

                stage('Deploy_all') {
                    when {
                        expression { params.build == 'Build_all' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down'"
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
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
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app restart frontend'"
                        }
                    }
                }

                stage('Restart_backend') {
                    when {
                        expression { params.build == 'Restart_backend' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app restart backend'"
                        }
                    }
                }

                stage('Restart_all') {
                    when {
                        expression { params.build == 'Restart_all' }
                    }
                    steps {
                        sshagent(["ec2-ssh-key"]) {
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down'"
                            sh "ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
                        }
                    }
                }
            }
        }
    }
}
