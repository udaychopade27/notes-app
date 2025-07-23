pipeline {
    agent any
    parameters{
        choice(choices:['Build_all','Build_backend','Build_frontend','Restart_frontend','Restart_backend','Restart_all'], description: 'Build parameter choices', name: 'build')
    }
    stages {
        stage('Checkout'){
            steps {
                sh "git --version"
                sh "docker -v"
                sh "echo Branch name: ${GIT_BRANCH}"
            }
        }
        stage('Build_stage'){
            environment {
               ENV_FILE = credentials("notes-app-env-file")
            }
            parallel{
                stage('Build_frontend'){
                    when{
                        expression{params.build == 'Build_frontend' || params.build == 'Build_all'}
                    }
                    steps{
                        sh "docker-compose -f docker-compose.yml build frontend"
                        }
                    }
                stage('Build_backend'){
                    when{
                        expression{params.build == 'Build_backend' || params.build == 'Build_all'}
                    }
                    steps{
                        sh "cp ${ENV_FILE} ."
                        sh "docker-compose -f docker-compose.yml --env-file ${ENV_FILE} build backend"
                    }
                }
            }
        }
        stage('Saving_images'){
            parallel{
                stage('saving_frontend'){
                    when{
                        expression{params.build == 'Build_frontend' || params.build == 'Build_all'}
                    }
                    steps {
                        sh "docker save notes-app-frontend -o frontend.tar"
                    }
                }
                stage('saving_backend'){
                    when{
                        expression{params.build == 'Build_backend' || params.build == 'Build_all'}
                    }
                    steps {
                        sh "docker save notes-app-backend -o backend.tar"
                    }
                }
            }
        }
        stage('Transfering_tar_file'){
            environment{
                ENV_FILE = credentials("notes-app-env-file")
                REMOTE_HOST = credentials("notes-app-remote-host")
                REMOTE_USER = credentials("notes-app-remote-user")
                PORT = credentials("notes-app-port")
                RWD = "deployments/notes-app/"
            }
            parallel{            
                stage('Transfer_Frontend'){
                    when{
                        expression{params.build == 'Build_frontend' || params.build == 'Build_all'}
                    }
                    steps {
                        sshagent(["notes-app-remote-server-ssh-creds"]) {
                            sh "scp -P ${PORT} -r frontend.tar ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                        }
                    }
                }
                stage('Transfer_Backend'){
                    when{
                        expression{params.build == 'Build_backend' || params.build == 'Build_all'}
                    }
                    steps {
                        sshagent(["notes-app-remote-server-ssh-creds"]) {
                            sh "scp -P ${PORT} -r backend.tar ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                        }
                    }
                }
                stage('Transfer_compose_file'){
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            // sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'rm -rf ${RWD}/notes-app-env-file'"
                            sh "scp -P ${PORT} -r docker-compose.yml  ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                            sh "scp -P ${PORT} -r ${ENV_FILE} ${REMOTE_USER}@${REMOTE_HOST}:${RWD}/"
                        }
                    }
                }
            }
        }
        stage('loading_images'){
            environment{
                ENV_FILE = credentials("notes-app-env-file")
                REMOTE_HOST = credentials("notes-app-remote-host")
                REMOTE_USER = credentials("notes-app-remote-user")
                PORT = credentials("notes-app-port")
                RWD = "deployments/notes-app/"
            }
            parallel{
                stage('loading_frontend'){
                    when{
                        expression{params.build == 'Build_frontend' || params.build == 'Build_all'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker load -i frontend.tar'"
                        }
                    }
                }
                stage('loading_backend'){
                    when{
                        expression{params.build == 'Build_backend' || params.build == 'Build_all'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker load -i backend.tar'"
                        }
                    }
                }
            }
        }
        stage('Deploying'){
            environment{
                ENV_FILE = credentials("notes-app-env-file")
                REMOTE_HOST = credentials("notes-app-remote-host")
                REMOTE_USER = credentials("notes-app-remote-user")
                PORT = credentials("notes-app-port")
                RWD = "deployments/notes-app/"
            }
            parallel{
                stage('Deploy_frontend'){
                    when{
                        expression{params.build == 'Build_frontend'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            // sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && DEPLOY_ENV=${DEPLOY_ENV} docker compose -f docker-compose.yml -f ${DEPLOY_ENV}.yml -p pmt-${DEPLOY_ENV} down frontend'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d frontend'"
                    }
                }
                }
                stage('Deploy_backend'){
                    when{
                        expression{params.build == 'Build_backend'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            // sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && DEPLOY_ENV=${DEPLOY_ENV} docker compose -f docker-compose.yml -f ${DEPLOY_ENV}.yml -p pmt-${DEPLOY_ENV} down backend'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d backend'"
                        }
                    }
                }
                stage('Deploy_all'){
                    when{
                        expression{params.build == 'Build_all'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
                        }
                    }
                }
            }        
        }
        stage('Restart Containers'){
            environment{
                ENV_FILE = credentials("notes-app-env-file")
                REMOTE_HOST = credentials("notes-app-remote-host")
                REMOTE_USER = credentials("notes-app-remote-user")
                PORT = credentials("notes-app-port")
                RWD = "deployments/notes-app/"
            }
            parallel{
                stage('Restart_frontend'){
                    when{
                        expression{params.build == 'Restart_frontend'}
                    }
                    steps{
                        sshagent(["pmt-${DEPLOY_ENV}-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down frontend'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d frontend'"
                    }
                }
                }
                stage('Restart_backend'){
                    when{
                        expression{params.build == 'Restart_backend'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down backend'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d backend'"
                        }
                    }
                }
                stage('Restart_all'){
                    when{
                        expression{params.build == 'Restart_all'}
                    }
                    steps{
                        sshagent(["notes-app-remote-server-ssh-creds"]){
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app down'"
                            sh "ssh -p ${PORT} ${REMOTE_USER}@${REMOTE_HOST} 'cd ${RWD} && docker-compose -f docker-compose.yml -p notes-app up -d'"
                        }
                    }
                }
            }        
        }
    }
}