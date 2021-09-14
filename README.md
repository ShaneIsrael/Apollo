<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/ShaneIsrael/Apollo">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Apollo</h3>

  <p align="center">
    A companion app for your HTPC media libraries
    <br />
    <a href="https://github.com/ShaneIsrael/Apollo"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ShaneIsrael/Apollo">View Demo</a>
    ·
    <a href="https://github.com/ShaneIsrael/Apollo/issues">Report Bug</a>
    ·
    <a href="https://github.com/ShaneIsrael/Apollo/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
# About The Project

I started this project in August of 2021 in my free time. It initially started out as me experimenting around with my own media library and quickly grew into what you see now.

Apollo is a companion app for your HTPC media libraries. It's a web app that can be accessed from anywhere to display infromation about your media collection. Information about your collection is gathered from TMDb and stored in a local database. Apollo will also scan your libraries files and store file specific information about your movies and series. Apollo will also use that information to generate statistics against your libraries as seen in the video below. Apollo will also watch your media libraries in real-time for changes and make updates to its database accordingly. 

Apollo is not a video player, at least at this time. It is web app to view series, movie, file and statistical information about your library. Some of the code has been rushed and will be refactored and improved (I've rushed through a lot in the last month).  

https://animetrics.sfo2.cdn.digitaloceanspaces.com/apollo/Apollo-Demo-So-Far-9-13-2021.mp4

### Built With

* [Node.js](https://nodejs.org/en/)
* [React](https://reactjs.org/)
* [Material UI](https://material-ui.com/)


<!-- GETTING STARTED -->
## Getting Started
___
***Apollo is currently in very early development. While Apollo is completely functional right now, future changes will likely require you to delete your local Apollo database in order to update it.***
___

There are two ways you can install and run Apollo.

1. [Download & Run the latest Apollo Binary](https://github.com/ShaneIsrael/Apollo/releases/)
2. Install & Run from source code

If you would like to run Apollo via the source code you will need to have npm and Node.js installed. I reccommend installing Node.js with NVM so that you can easily switch between Node versions. This project currently uses Node 12.x but will likely change.

### Prerequisites


* nvm - [Download & Install instructions](https://github.com/nvm-sh/nvm#installing-and-updating)
  ```sh
  nvm install 12.19.0
  ```

### Installation

1. [Get a TMDb Api Key](https://www.themoviedb.org/)
2. Clone the repo
   ```sh
   git clone https://github.com/ShaneIsrael/Apollo.git
   ```
3. Install NPM packages
   ```sh
   cd server && npm install && cd ../ui && npm install
   ```
4. Enter your API Key. In the server folder, copy `.env.example` to `.env`
   ```JS
   TMDB_API_KEY="ENTER YOUR API KEY"
   TMDB_READ_ACCESS_TOKEN="ENTER YOUR READ ACCESS TOKEN"
   ```



<!-- USAGE EXAMPLES -->
## Usage

1. Start the server
   ```
   cd server && npm start
   ```
2. Start the UI
   ```
   cd ui && npm start
   ```



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- CONTACT -->
## Contact

Shane Israel - [LinkedIn](https://www.linkedin.com/in/shane-israel-3a685ba1/) - shanemisrael@gmail.com

Project Link: [https://github.com/ShaneIsrael/Apollo](https://github.com/ShaneIsrael/Apollo)




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ShaneIsrael/Apollo.svg?style=for-the-badge
[contributors-url]: https://github.com/ShaneIsrael/Apollo/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ShaneIsrael/Apollo.svg?style=for-the-badge
[forks-url]: https://github.com/ShaneIsrael/Apollo/network/members
[stars-shield]: https://img.shields.io/github/stars/ShaneIsrael/Apollo.svg?style=for-the-badge
[stars-url]: https://github.com/ShaneIsrael/Apollo/stargazers
[issues-shield]: https://img.shields.io/github/issues/ShaneIsrael/Apolloe.svg?style=for-the-badge
[issues-url]: https://github.com/ShaneIsrael/Apollo/issues
[license-shield]: https://img.shields.io/github/license/ShaneIsrael/Apollo.svg?style=for-the-badge
[license-url]: https://github.com/ShaneIsrael/Apollo/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/shane-israel-3a685ba1/
[product-screenshot]: images/apollo_dashboard.png
