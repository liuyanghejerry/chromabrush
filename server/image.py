
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
      
    file_data = memcache.get("file|%s" % key)
    file_type = memcache.get("type|%s" % key)
    
    if file_data is None:
      self.response.out.write('No data')
      return
      
    self.response.headers["Content-Type"] = file_type
    self.response.out.write(file_data)
  
  def post(self, key=None):
    key = hashlib.sha1(self.request.body).hexdigest()
    file_data = self.request.body
    file_type = self.request.headers['X-File-Type']
    
    if file_type.lower() not in ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']:
      self.response.out.write('invalid type')
      return
      
    memcache.add("file|%s" % key, file_data, 60)
    memcache.add("type|%s" % key, file_type, 60)
    
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
