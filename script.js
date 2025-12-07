function welcomeMessage() {
  alert("Hai cliccato il bottone! Funziona 😄");
}




// Tracciamento hover e click sulle card
document.querySelectorAll('.playlist-card').forEach(card => {
  const name = card.dataset.name;

  card.addEventListener('mouseenter', () => {
    dataLayer.push({
      event: 'hover_card',
      card_name: name
    });
  });

  card.addEventListener('click', () => {
    dataLayer.push({
      event: 'card_click',
      card_name: name
    });
  });
});



document.addEventListener('DOMContentLoaded', function () {
  const players = document.querySelectorAll('iframe.soundcloud-player');

  players.forEach((iframe, index) => {
    const playerId = iframe.id;
    const trackName = iframe.closest('.playlist-card')?.dataset.name || `Track ${index + 1}`;
    const widget = SC.Widget(iframe);
    let hasPlayed = false;

    widget.bind(SC.Widget.Events.READY, function () {
      widget.bind(SC.Widget.Events.PLAY, function () {
        if (!hasPlayed) {
          widget.getPosition(function (position) {
            dataLayer.push({
              event: 'soundcloud_play',
              track_name: trackName,
              timestamp: Math.floor(position / 1000)
            });
          });
          hasPlayed = true;
        }
      });

      widget.bind(SC.Widget.Events.PAUSE, function () {
        widget.getPosition(function (position) {
          dataLayer.push({
            event: 'soundcloud_pause',
            track_name: trackName,
            timestamp: Math.floor(position / 1000)
          });
        });
        hasPlayed = false; // reset per consentire nuovo play
      });

      widget.bind(SC.Widget.Events.FINISH, function () {
        dataLayer.push({
          event: 'soundcloud_finish',
          track_name: trackName,
          timestamp: 'end'
        });
        hasPlayed = false; // reset anche al termine della traccia
      });
    });
  });
  
});
