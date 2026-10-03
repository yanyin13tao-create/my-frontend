pipeline {
  agent any

  environment {
    IMAGE_NAME = 'my-frontend-static'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Install') {
      agent {
        docker {
          image 'node:22-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'npm install'
      }
    }

    stage('Lint') {
      agent {
        docker {
          image 'node:22-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build App') {
      agent {
        docker {
          image 'node:22-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Static Image') {
      steps {
        sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
      }
    }
  }
}
