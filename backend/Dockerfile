# Image officielle Node.js version 20 
FROM node:20-alpine          

# Définit le dossier de travail dans le conteneur
WORKDIR /app                 

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./        

# Installe les dépendances
RUN npm install              

# Copie tout le reste du code source
COPY . .                     

# Indique que l’application écoute sur le port 5000
EXPOSE 4000                 

# Commande de démarrage par défaut
CMD ["node", "server.js"]   