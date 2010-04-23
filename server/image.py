
import logging
import hashlib

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import memcache

class MainHandler(webapp.RequestHandler):

  def get(self, key=None):
    logging.info(key)
    
    if key is None:
      self.response.out.write('Invalid key')
      return
      
    data = memcache.get(key)
    
    if data is None:
      self.response.out.write('No data')
      return
      
    self.response.headers["Content-Type"] = "image/jpeg"
    self.response.out.write(data)
  
  def post(self, key=None):
    key = hashlib.sha1(self.request.body).hexdigest()
    memcache.add(key, self.request.body, 60)
    
    url = "%s/image/%s" % (self.request.host_url, key)
    logging.info(self.request.headers)
    logging.info(url)
        
    self.response.out.write(url)

def main():
  application = webapp.WSGIApplication([
      ('/image/?(.*)', MainHandler)
  ], debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()
