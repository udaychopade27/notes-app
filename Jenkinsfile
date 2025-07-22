pipeline {
    agent any
    parameters {
        choice(choices: ['Build_all', 'Build_backend', 'Build_frontend', 'Restart_frontend', 'Restart_backend', 'Restart_all'], description: 'Build parameter choices', name: 'build')
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
            environment {
                ENV_FILE = credentials("notes-app-env-file")
            }
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

        stage('Saving_images') {
            parallel {
                stage('saving_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker save notes-app-frontend -o frontend.tar"
                    }
                }
                stage('saving_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker save notes-app-backend -o backend.tar"
                    }
                }
            }
        }

        stage('Transfering_tar_file') {
            environment {
                ENV_FILE = credentials("notes-app-env-file")
                RWD = "/app/notes-app"
            }
            parallel {
                stage('Transfer_Frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker cp frontend.tar webserver:${RWD}/frontend.tar"
                    }
                }
                stage('Transfer_Backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker cp backend.tar webserver:${RWD}/backend.tar"
                    }
                }
                stage('Transfer_compose_file') {
                    steps {
                        sh "docker cp docker-compose.yml webserver:${RWD}/docker-compose.yml"
                        sh "docker cp ${ENV_FILE} webserver:${RWD}/notes-app-env-file"
                    }
                }
            }
        }

        stage('loading_images') {
            environment {
                RWD = "/app/notes-app"
            }
            parallel {
                stage('loading_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker load -i frontend.tar'"
                    }
                }
                stage('loading_backend') {
                    when {
                        expression { params.build == 'Build_backend' || params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker load -i backend.tar'"
                    }
                }
            }
        }

        stage('Deploying') {
            environment {
                RWD = "/app/notes-app"
            }
            parallel {
                stage('Deploy_frontend') {
                    when {
                        expression { params.build == 'Build_frontend' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d frontend'"
                    }
                }
                stage('Deploy_backend') {
                    when {
                        expression { params.build == 'Build_backend' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d backend'"
                    }
                }
                stage('Deploy_all') {
                    when {
                        expression { params.build == 'Build_all' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
                    }
                }
            }
        }

        stage('Restart Containers') {
            environment {
                RWD = "/app/notes-app"
            }
            parallel {
                stage('Restart_frontend') {
                    when {
                        expression { params.build == 'Restart_frontend' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down frontend'"
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d frontend'"
                    }
                }
                stage('Restart_backend') {
                    when {
                        expression { params.build == 'Restart_backend' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down backend'"
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d backend'"
                    }
                }
                stage('Restart_all') {
                    when {
                        expression { params.build == 'Restart_all' }
                    }
                    steps {
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down'"
                        sh "docker exec -it webserver bash -c 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
                    }
                }
            }
        }
    }
}
